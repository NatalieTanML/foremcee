<template>
  <div class="flex flex-row relative block bg-gray-50 rounded-md p-3 mb-2 hover:bg-indigo-50">
    <div class="flex flex-1 items-center">
      <div class="flex-1">
        <p class=" uppercase tracking-wide font-semibold text-xs text-gray-600">Recorded at</p>
        <p class=" uppercase tracking-wide font-bold text-md text-gray-800">12:34 PM</p>
      </div>
      <button class="flex flex-col rounded-md w-10 h-10 text-indigo-600 hover:stroke-current hover:text-white hover:bg-indigo-500 hover:border-transparent focus:outline-none active:bg-indigo-700 justify-center items-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      </button>
      <button class="flex flex-col rounded-md w-10 h-10 text-indigo-600 hover:stroke-current hover:text-white hover:bg-indigo-500 hover:border-transparent focus:outline-none active:bg-indigo-700  justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style>

</style>