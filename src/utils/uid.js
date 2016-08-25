export default () => ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
