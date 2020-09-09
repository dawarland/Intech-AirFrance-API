const app = require('./app');

app.listen(process.env.PORT || 3000, () => {
    console.log("Air France's server listening on port "+ (process.env.PORT || 3000 ) )
});
