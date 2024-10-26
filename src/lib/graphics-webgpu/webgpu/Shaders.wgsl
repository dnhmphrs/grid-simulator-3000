// webgpu/Shaders.wgsl

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),  // Bottom-left
    vec2<f32>(3.0, -1.0),   // Bottom-right (out of bounds to cover screen)
    vec2<f32>(-1.0, 3.0)    // Top-left (out of bounds to cover screen)
  );
  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

@fragment
fn fragment_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
  // Assume a viewport size, e.g., 800x600. Adjust if you know the actual dimensions.
  let viewportSize = vec2<f32>(800.0, 600.0); 
  
  // Normalize screen coordinates to range [0.0, 1.0]
  let normalizedCoord = fragCoord.xy / viewportSize;

  // Calculate color based on screen position
  let color = vec3<f32>(
    normalizedCoord.x,               // Red varies with horizontal position
    normalizedCoord.y,               // Green varies with vertical position
    0.5 * (1.0 - normalizedCoord.x)  // Blue varies inversely with x
  );

  return vec4<f32>(color, 1.0);
}
