use wasm_bindgen::prelude::*;
use image::{ImageOutputFormat};
use std::io::Cursor;

#[wasm_bindgen]
pub fn process_image(data: &[u8], width: u32, blur_sigma: f32) -> Vec<u8> {
    // 1. 加载图片
    let img = image::load_from_memory(data).expect("Failed to load image");

    // 2. 缩放 (保持比例)
    let scaled = img.resize(width, (width as f32 * (img.height() as f32 / img.width() as f32)) as u32, image::imageops::FilterType::Triangle);

    // 3. 模糊处理
    let blurred = if blur_sigma > 0.0 {
        scaled.blur(blur_sigma)
    } else {
        scaled
    };

    // 4. 编码为 JPEG 返回
    let mut result = Vec::new();
    blurred.write_to(&mut Cursor::new(&mut result), ImageOutputFormat::Jpeg(60)).expect("Failed to encode");
    
    result
}