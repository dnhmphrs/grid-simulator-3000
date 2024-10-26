import shaderCode from './Shaders.wgsl';

let mouseUniformBuffer;
let viewportUniformBuffer;

export async function createRenderPipeline(device) {
	// Use the preferred canvas format
	const format = navigator.gpu.getPreferredCanvasFormat(); // Updated here

	// Create a uniform buffer for mouse position
	const UNIFORM_BUFFER_USAGE = 0x10; // Equivalent to GPUBufferUsage.UNIFORM
	const COPY_DST_BUFFER_USAGE = 0x4; // Equivalent to GPUBufferUsage.COPY_DST

	// Create a uniform buffer for viewport size (2 floats: width, height)
	viewportUniformBuffer = device.createBuffer({
		size: 8, // 2 floats (width, height)
		usage: UNIFORM_BUFFER_USAGE | COPY_DST_BUFFER_USAGE
	});

	// Create a uniform buffer for mouse position (2 floats: x, y)
	mouseUniformBuffer = device.createBuffer({
		size: 8, // 2 floats (x, y)
		usage: UNIFORM_BUFFER_USAGE | COPY_DST_BUFFER_USAGE
	});

	const pipeline = device.createRenderPipeline({
		layout: 'auto',
		vertex: {
			module: device.createShaderModule({ code: shaderCode }),
			entryPoint: 'vertex_main'
		},
		fragment: {
			module: device.createShaderModule({ code: shaderCode }),
			entryPoint: 'fragment_main',
			targets: [{ format }] // Use the preferred format
		}
	});

	return pipeline;
}

// Function to update viewport size in the uniform buffer
export function updateViewportSize(device, width, height) {
	const viewportSize = new Float32Array([width, height]);
	device.queue.writeBuffer(viewportUniformBuffer, 0, viewportSize);
}

// Update mouse position in the uniform buffer
export function updateMousePosition(device, x, y) {
	const mousePosition = new Float32Array([x, y]);
	device.queue.writeBuffer(mouseUniformBuffer, 0, mousePosition);
}
