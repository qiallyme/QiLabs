import os
import yaml
import json
import jsonschema

def validate_schema(yaml_path, schema_path):
    if not os.path.exists(yaml_path) or not os.path.exists(schema_path):
        return True
    
    with open(yaml_path, 'r') as y:
        data = yaml.safe_load(y)
        
    with open(schema_path, 'r') as s:
        schema = json.load(s)
        
    try:
        jsonschema.validate(instance=data, schema=schema)
        print(f"PASS: {yaml_path}")
        return True
    except jsonschema.exceptions.ValidationError as e:
        print(f"FAIL: {yaml_path} - {e.message}")
        return False

def check_folders():
    required_sections = [
        "01_governance", "02_architecture", "03_structure",
        "04_data", "05_compute", "06_applications", "07_operations"
    ]
    
    docs_dir = os.path.join(os.path.dirname(__file__), '..', 'docs')
    
    for section in required_sections:
        if not os.path.exists(os.path.join(docs_dir, section)):
            print(f"FAIL: Missing required section {section}")
            return False
    print("PASS: Folder structure validated.")
    return True

if __name__ == "__main__":
    passed = True
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    
    passed = passed and check_folders()
    passed = passed and validate_schema(
        os.path.join(base_dir, 'registry', 'band_registry.yaml'),
        os.path.join(base_dir, 'schemas', 'band_registry.schema.json')
    )
    
    if not passed:
        exit(1)
    
    print("All architecture checks passed.")
