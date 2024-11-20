<template>
  <div>

  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router';
  const route = useRoute();
  
  try {
    window.android.paySucceed(route.query) 
  } catch (err) {
    console.log(err);
  }

</script>

<style lang="scss" scoped></style>