use std::fs;

// --- GENETIC DATA (HARDCODED MORPHOLOGY) ---
const LOGO_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 10 C80 10, 80 30, 50 30 C20 30, 20 50, 50 50 C80 50, 80 70, 50 70 C20 70, 20 90, 50 90" fill="none" stroke="#00FFCC" stroke-width="2.5" stroke-linecap="round" />
  <path d="M50 10 C20 10, 20 30, 50 30 C80 30, 80 50, 50 50 C20 50, 20 70, 50 70 C80 70, 80 90, 50 90" fill="none" stroke="#00FFCC" stroke-width="2.5" stroke-linecap="round" opacity="0.4" />
  <circle cx="50" cy="10" r="3" fill="#00FFCC" />
  <circle cx="50" cy="30" r="3" fill="#00FFCC" />
  <circle cx="50" cy="50" r="3" fill="#00FFCC" />
  <circle cx="50" cy="70" r="3" fill="#00FFCC" />
  <circle cx="50" cy="90" r="3" fill="#00FFCC" />
  <line x1="28" y1="20" x2="72" y2="20" stroke="#00FFCC" stroke-width="1" opacity="0.3" />
  <line x1="28" y1="40" x2="72" y2="40" stroke="#00FFCC" stroke-width="1" opacity="0.3" />
  <line x1="28" y1="60" x2="72" y2="60" stroke="#00FFCC" stroke-width="1" opacity="0.3" />
  <line x1="28" y1="80" x2="72" y2="80" stroke="#00FFCC" stroke-width="1" opacity="0.3" />
</svg>"##;

const MANIFESTO: &str = "---\nnode_id: ROOT_GENESIS_001\ntype: Genesis_Authority\n---\n# The QiNode Manifesto\n## Knowledge Retention & Atom-Bomb Resilience.\n\nWelcome to the Genesis Cell. This is the first unit of a Local-First, Cellular Self-Healing Autonomous Knowledge Organism.\n\n### The Core Laws:\n1. Sovereignty: This folder is a complete, independent unit.\n2. Resilience: Every file contains the DNA to rebuild the organism.\n3. Mitochondria: Every cell powers its own intelligence.\n\n![QiNode Logo](bin/logo.svg)";

fn main() -> std::io::Result<()> {
    println!("Initializing Morphogenesis...");

    // 1. PHASE: SCAFFOLDING
    fs::create_dir_all("src")?;

    let cargo_toml = "[package]\nname = \"qinode-engine\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n[dependencies]\nserde = { version = \"1.0\", features = [\"derive\"] }\nserde_json = \"1.0\"\nuuid = { version = \"1.6\", features = [\"v4\"] }\nsha2 = \"0.10\"\nchrono = \"0.4\"\npdfium-render = \"0.8\"\nimage = { version = \"0.24\", features = [\"webp\"] }";
    fs::write("Cargo.toml", cargo_toml)?;

    let main_rs = r##"use pdfium_render::prelude::*;
use std::fs;
use std::path::Path;
use uuid::Uuid;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🧬 [QIONDRIA ENGINE] Initializing Metabolic Ingestion...");
    let sample_pdf = "input.pdf";
    if Path::new(sample_pdf).exists() {
        ingest_pdf(sample_pdf)?;
    } else {
        println!("⚠️ No 'input.pdf' found. Please provide a document to begin metabolism.");
    }
    Ok(())
}

fn ingest_pdf(pdf_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("🧪 Metabolizing: {}", pdf_path);
    let pdfium = Pdfium::new(
        Pdfium::bind_to_library(Pdfium::pdfium_platform_library_name_at_path("./"))
            .or_else(|_| Pdfium::bind_to_system_library())?
    );
    let document = pdfium.load_pdf_from_file(pdf_path, None)?;
    let node_id = Uuid::new_v4().to_string();
    let node_dir = format!("QiNode_{}", node_id);
    fs::create_dir_all(format!("{}/bin", node_dir))?;
    println!("🏗  Constructing Node: {}", node_dir);
    let render_config = PdfRenderConfig::new().set_target_width(1200);
    for (index, page) in document.pages().iter().enumerate() {
        let bitmap = page.render_with_config(&render_config)?;
        let image = bitmap.as_image();
        let output_path = format!("{}/bin/page_{}.webp", node_dir, index + 1);
        image.save_with_format(output_path, image::ImageFormat::WebP)?;
    }
    println!("✅ Metabolism Complete. Node stabilized.");
    Ok(())
}"##;
    fs::write("src/main.rs", main_rs)?;

    // 2. PHASE: GENESIS CELL
    let genesis_dir = "QiNode_Genesis_Root";
    let node_uuid = "00000000-0000-4000-a000-000000000001";

    fs::create_dir_all(format!("{}/bin", genesis_dir))?;
    fs::create_dir_all(format!("{}/.node", genesis_dir))?;

    fs::write(format!("{}/bin/logo.svg", genesis_dir), LOGO_SVG)?;
    fs::write(format!("{}/index.md", genesis_dir), MANIFESTO)?;
    fs::write(format!("{}/.node_id", genesis_dir), node_uuid)?;

    // 3. PHASE: DNA (Manual JSON string to avoid dependency errors)
    let dna_json = format!("{{\n  \"dna\": {{\n    \"uuid\": \"{}\",\n    \"canonical_name\": \"GENESIS_ROOT\",\n    \"is_authority\": true\n  }},\n  \"integrity\": {{\n    \"asset_manifest\": {{\n      \"logo.svg\": \"internal_morphology\"\n    }}\n  }}\n}}", node_uuid);
    fs::write(format!("{}/data.json", genesis_dir), dna_json)?;

    println!("Expansion Complete. Genesis Cell synthesized.");
    Ok(())
}
