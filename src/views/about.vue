<style src="src/css/normalize"></style>
<style>
  .about {
    -webkit-app-region: drag;

    .info {
      height: 60%;
      text-align: center;
      padding-top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    h1.title {
      font-size: 12px;
      font-weight: normal;
      margin-top: 10px;
      margin-bottom: 15px;
      text-align: center;
    }
    h2.name {
      font-size: 16px;
      margin: 0;
      margin-top: 10px;
    }
    .version {
      font-size: 12px;
    }
    .copyright {
      height: 30%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: #666;
    }
  }
</style>

<template>
  <div id="app" class="about">
    <h1 class="title">About EME</h1>

    <div class="info">
      <img :src="'../resources/icon.png'" alt="">
      <h2 class="name">EME</h2>
      <div class="version">
        Version: <strong>{{ pkg.version }}</strong>
      </div>
    </div>

    <div class="copyright">
      Copyright &copy; {{ year }} UNIPA, Inc.
    </div>
  </div>
</template>

<script>
  import pkg from '../package.json'

  export default {
    data() {
      return {
        pkg,
        year: new Date().getFullYear()
      }
    }
  }
</script>
