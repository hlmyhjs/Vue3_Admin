<template>
  <div></div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { params, query } = route
const { path } = params

router.replace({ path: '/' + path, query })
</script>
