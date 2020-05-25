<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    aria-hidden="true"
    focusable="false"
    width="0.88em"
    height="1em"
    style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 14 16"
    v-b-tooltip.hover
    :title="clipBoardToolTip"
    @click="copyToClipboard"
    @mouseleave="resetClipBoardToolTip"
  >
    <path
      fill-rule="evenodd"
      d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3l3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7c-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2c1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1s-1 .45-1 1s-.45 1-1 1H3c-.55 0-1 .45-1 1z"
      fill="#000000"
    />
  </svg>
</template>

<script>
export default {
  data() {
    return {
      clipBoardToolTip: "Copy To Clipboard"
    };
  },
  props: ["copyElementId"],
  methods: {
    copyToClipboard() {
      const textToCopy = document.getElementById(this.copyElementId);
      textToCopy.setAttribute("type", "text");
      textToCopy.select();
      document.execCommand("copy");
      textToCopy.setAttribute("type", "hidden");
      window.getSelection().removeAllRanges();
      this.clipBoardToolTip = "Copied!";
    },
    resetClipBoardToolTip() {
      setTimeout(() => (this.clipBoardToolTip = "Copy To Clipboard"), 300);
    }
  }
};
</script>

<style scoped>
svg {
  cursor: pointer;
}
</style>