import shaderCode from './shaders/basic.wgsl';

let mouseUniformBuffer;
let viewportUniformBuffer;

export async function createRenderPipeline(device) {
	// Use the preferred canvas format
	const format = navigator.gpu.getPreferredCanvasFormat(); // Updated here

	// Create a uniform buffer for viewport size (2 floats: width, height)
	viewportUniformBuffer = device.createBuffer({
		label: 'viewport uniform buffer',
		size: 8, // 2 floats (width, height)
		// eslint-disable-next-line no-undef
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST // Corrected: UNIFORM and COPY_DST
	});

	// Create a uniform buffer for mouse position (2 floats: x, y)
	mouseUniformBuffer = device.createBuffer({
		label: 'mouse uniform buffer',
		size: 8, // 2 floats (x, y)
		// eslint-disable-next-line no-undef
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST // Corrected: UNIFORM and COPY_DST
	});

	const pipeline = device.createRenderPipeline({
		label: 'main pipeline',
		layout: 'auto',
		vertex: {
			module: device.createShaderModule({ label: 'basic vert', code: shaderCode }),
			entryPoint: 'vertex_main'
		},
		fragment: {
			module: device.createShaderModule({ label: 'basic frag', code: shaderCode }),
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
