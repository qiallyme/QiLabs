use image::DynamicImage;
use pdfium_render::prelude::*;
use std::fs;
use std::path::Path;
use uuid::Uuid;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🧬 [QIONDRIA ENGINE] Initializing Metabolic Ingestion...");

    // Example ingestion (In a real app, this would come from an argument)
    let sample_pdf = "input.pdf";

    if Path::new(sample_pdf).exists() {
        ingest_pdf(sample_pdf)?;
    } else {
        println!(
            "⚠️ No 'input.pdf' found in the root. Please provide a document to begin metabolism."
        );
    }

    Ok(())
}

fn ingest_pdf(pdf_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("🧪 Metabolizing: {}", pdf_path);

    // 1. Initialize PDFium
    // On Windows, we need the pdfium.dll. We can bundle it or expect it in the path.
    let pdfium = Pdfium::new(
        Pdfium::bind_to_library(Pdfium::pdfium_platform_library_name_at_path("./"))
            .or_else(|_| Pdfium::bind_to_system_library())?,
    );

    // 2. Load Document
    let document = pdfium.load_pdf_from_file(pdf_path, None)?;

    // 3. Create Node Identification (UUID)
    let node_id = Uuid::new_v4().to_string();
    let node_dir = format!("QiNode_{}", node_id);
    fs::create_dir_all(format!("{}/bin", node_dir))?;

    println!("🏗  Constructing Node: {}", node_dir);

    // 4. Render Pages to WebP
    let render_config = PdfRenderConfig::new()
        .set_target_width(1200) // Quality balance
        .rotate_if_landscape(PdfPageRenderRotation::None, true);

    for (index, page) in document.pages().iter().enumerate() {
        let page_number = index + 1;
        println!("   📄 Processing Page {}...", page_number);

        let bitmap = page.render_with_config(&render_config)?;
        let image = bitmap.as_image(); // Converts to image::DynamicImage

        let output_path = format!("{}/bin/page_{}.webp", node_dir, page_number);
        image.save_with_format(output_path, image::ImageFormat::WebP)?;
    }

    // 5. Generate DNA (data.json)
    let dna_json = format!(
        r#"{{
  "dna": {{
    "uuid": "{}",
    "type": "Metabolic_Derived",
    "source": "{}",
    "timestamp": "{}"
  }}
}}"#,
        node_id,
        pdf_path,
        chrono::Utc::now().to_rfc3339()
    );
    fs::write(format!("{}/data.json", node_dir), dna_json)?;

    println!("✅ Metabolism Complete. Node stabilized.");
    Ok(())
}
