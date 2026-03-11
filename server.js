process.loadEnvFile?.();

const app = require('./server/app');

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`دوري رمضان يعمل على المنفذ ${port}`);
});
