<script>
  import { onMount } from 'svelte';
  import { initializeWebGPU } from './webgpu/WebGPUContext.js';
  import { createRenderPipeline, updateViewportSize } from './webgpu/RenderPipeline.js';
  import { createComputePipeline, initializeComputeBuffers, readBuffer, runComputePass } from './webgpu/ComputePipeline.js';

  let canvas;
  let device, context, pipeline, computePipeline;

  onMount(async () => {
    ({ device, context } = await initializeWebGPU(canvas));

    // Initialize compute buffers
    initializeComputeBuffers(device);

    pipeline = await createRenderPipeline(device);
    computePipeline = await createComputePipeline(device);

    if (device && context && computePipeline) {
      resizeCanvas();
      await runComputePass(device, computePipeline); // Run compute pass before rendering
      await device.queue.onSubmittedWorkDone();

      // Map readBuffer for reading back data
      {
        await readBuffer.mapAsync(GPUMapMode.READ);
        const mappedData = new Float32Array(readBuffer.getMappedRange());

        console.log("Computed data:", mappedData.slice(0, 10));
        readBuffer.unmap();
      }

      render();
    }

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  function resizeCanvas() {
    if (!canvas) return;
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
    canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);

    updateViewportSize(device, canvas.width, canvas.height);
  }

  function render() {
    if (!device || !context || !pipeline) return;

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
  }
</script>

<canvas bind:this={canvas} class="geometry"></canvas>

<style>
.geometry {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  padding: 0;
  margin: 0;
  border: none;
  z-index: -1;
  /* opacity: 0;
  transition: opacity 0.5s ease-in-out; */
}
</style>
