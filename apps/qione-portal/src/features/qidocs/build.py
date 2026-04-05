import os
import shutil
import yaml
import markdown
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
import re

def slugify(text):
    return re.sub(r'[\s]+', '-', text.lower().strip()).replace('/', '-')

class KBBuilder:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.env = Environment(loader=FileSystemLoader('templates'))
        self.md = markdown.Markdown(extensions=['extra', 'toc', 'meta', 'codehilite'])
        
    def get_last_updated(self, filepath):
        stat = os.stat(filepath)
        return datetime.fromtimestamp(stat.st_mtime).strftime('%B %d, %Y')

    def generate_sidebar(self, content_dir, base_path):
        sidebar_html = '<ul class="sidebar-list">'
        
        # Sort directories and files
        items = sorted(os.listdir(content_dir))
        
        for item in items:
            item_path = os.path.join(content_dir, item)
            if os.path.isdir(item_path):
                category_name = item.replace('-', ' ').title()
                sidebar_html += f'<li class="category-title">{category_name}</li>'
                sidebar_html += '<ul>'
                sub_items = sorted(os.listdir(item_path))
                for sub_item in sub_items:
                    if sub_item.endswith('.md'):
                        title = sub_item.replace('.md', '').replace('-', ' ').title()
                        url = f"{base_path}/{item}/{sub_item.replace('.md', '')}"
                        sidebar_html += f'<li><a href="{url}">{title}</a></li>'
                sidebar_html += '</ul>'
            elif item.endswith('.md') and item != 'index.md':
                title = item.replace('.md', '').replace('-', ' ').title()
                url = f"{base_path}/{item.replace('.md', '')}"
                sidebar_html += f'<li><a href="{url}">{title}</a></li>'
        
        sidebar_html += '</ul>'
        return sidebar_html

    def generate_breadcrumbs(self, rel_path, base_path):
        parts = rel_path.split(os.sep)
        crumbs = [f'<a href="{base_path}/">Home</a>']
        accumulated_path = base_path
        
        for i, part in enumerate(parts):
            if not part: continue
            part_name = part.replace('.md', '').replace('-', ' ').title()
            if i == len(parts) - 1:
                crumbs.append(f'<span>{part_name}</span>')
            else:
                accumulated_path += f'/{part}'
                crumbs.append(f'<a href="{accumulated_path}">{part_name}</a>')
        
        return ' / '.join(crumbs)

    def build_target(self, target_key):
        target = self.config[target_key]
        content_dir = target['content_dir']
        output_dir = target['output_dir']
        base_url = target['base_url'] # This is the full domain, but we need relative for assets usually
        
        # Treat base_path for HTML links
        # If internal: /kb, if public: /help
        base_path = ""
        if target_key == 'internal':
            base_path = "/kb"
        else:
            base_path = "/help"

        print(f"Building {target_key} KB to {output_dir}...")

        # Clear output dir
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        os.makedirs(output_dir, exist_ok=True)

        # Copy assets
        shutil.copytree('assets', os.path.join(output_dir, 'assets'), dirs_exist_ok=True)

        sidebar_html = self.generate_sidebar(content_dir, base_path)

        for root, dirs, files in os.walk(content_dir):
            for file in files:
                if not file.endswith('.md'):
                    continue
                
                md_path = os.path.join(root, file)
                rel_path = os.path.relpath(md_path, content_dir)
                html_rel_path = rel_path.replace('.md', '').strip(os.sep)
                
                # Determine output path (directory-based routing)
                if file == 'index.md':
                    target_html_dir = os.path.join(output_dir, os.path.dirname(rel_path))
                else:
                    target_html_dir = os.path.join(output_dir, html_rel_path)
                
                os.makedirs(target_html_dir, exist_ok=True)
                target_html_path = os.path.join(target_html_dir, 'index.html')

                # Process Markdown
                with open(md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                html_content = self.md.reset().convert(content)
                metadata = self.md.Meta
                
                title = metadata.get('title', [file.replace('.md', '').replace('-', ' ').title()])[0]
                description = metadata.get('description', ['QiAlly Knowledge Base Article'])[0]
                
                # Templates
                template = self.env.get_template('kb_article.html')
                
                # Breadcrumbs
                breadcrumbs_html = self.generate_breadcrumbs(rel_path, base_path)

                # TOC
                toc_html = self.md.toc

                rendered_html = template.render(
                    site_title=self.config['site_title'],
                    branding=self.config['branding'],
                    page_title=title,
                    title=title,
                    description=description,
                    article_content=html_content,
                    sidebar_html=sidebar_html,
                    breadcrumbs_html=breadcrumbs_html,
                    toc_html=toc_html,
                    last_updated=self.get_last_updated(md_path),
                    label=target['label'],
                    mode_class='internal-mode' if target_key == 'internal' else 'public-mode',
                    base_path=base_path
                )

                with open(target_html_path, 'w', encoding='utf-8') as f:
                    f.write(rendered_html)

        print(f"Finished building {target_key}")

    def build_all(self):
        self.build_target('internal')
        self.build_target('public')

if __name__ == "__main__":
    builder = KBBuilder('config.yaml')
    builder.build_all()
