<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">Get Started</h1>
        <p class="mt-2 text-sm text-gray-700">Get started by going to the <TabReference to="/entries">Entries</TabReference> tab.</p>
        <div class="my-4"></div>
        <h1 class="text-base font-semibold leading-6 text-gray-900">About</h1>
        <p class="mt-2 text-sm text-gray-700">Show Sequence Creator will generate a show spacing out the people and event types entered. The creator will also keep certain event at a specified spot in the show by entering a percent into the entry. 100% will be the end of the show, 0% is the beginning.</p>
        <p class="mt-2 text-sm text-gray-700">Made by Brandon Young.</p>
        <div class="my-4"></div>
        <h2 class="text-base font-semibold leading-6 text-gray-900">Suggestions</h2>
        <p class="mt-2 text-sm text-gray-700">If you have any suggestions feel free to send them to <Link href="mailto:youngbrandon007@gmail.com">youngbrandon007@gmail.com</Link>.</p>
        <div class="my-4"></div>
        <h2 class="text-base font-semibold leading-6 text-gray-900">Contribute</h2>
        <p class="mt-2 text-sm text-gray-700">If you would like to contribute or check out how this was made look <Link href="https://github.com/youngbrandon007/sequencecreator">https://github.com/youngbrandon007/sequencecreator</Link>.</p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabReference from "@/components/TabReference.vue";
import Link from "@/components/Link.vue"
</script>