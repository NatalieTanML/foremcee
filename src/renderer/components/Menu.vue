<template>
  <div class="container mx-auto py-4 px-4 w-full bg-white">
    <!-- Title + Settings button -->
    <div class="flex flex-row">
      <div class="flex flex-1 items-center">
        <p class="flex-grow text-2xl font-bold tracking-tight text-indigo-600">Voice Notes</p>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- List of recordings -->
    <div class="">
      <list-header></list-header>
      <list-item></list-item>
      <list-item></list-item>
      <list-item></list-item>
      <list-header></list-header>
      <list-item></list-item>
      <list-item></list-item>
      <list-item></list-item>
      <list-item></list-item>
      <list-item></list-item>
      <list-item></list-item>
    </div>
    
  </div>
</template>

<script>
import ListHeader from './ListHeader'
import ListItem from './ListItem'

export default {
  name: 'Menu',
  components: { ListHeader, ListItem },
  data () {
    return {}
  }
}
</script>

<style>

</style>