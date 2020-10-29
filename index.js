const express = require('express')
const cors = require('cors')
const superagent = require('superagent')
const app = express()

app.use(express.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE')
  app.use(cors())
  next();
})

const client_id = process.env.REACT_APP_CLIENT_ID
const client_secret = process.env.REACT_APP_CLIENT_SECRET

app.get('/', (request, response) => {
  response.send('Simple OAuth app')
})

// app.get('/login/github', (request, response) => {

//   const url = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${host}/Authorize`
//   response.redirect(url)
// })


app.post('/Authorize', async (request, response) => {

  const { code } = request.body

  const data = await superagent
    .post('https://github.com/login/oauth/access_token')
    .send({ client_id, client_secret, code })
    .set('Accept', 'application/json')
    .catch((err) => {
      console.log(err)
      response.send(err)
    })

  const access_data = await JSON.parse(data.text)

  const user = await superagent
    .get('https://api.github.com/user')
    .set('Authorization', `${access_data.token_type} ${access_data.access_token}`)
    .set('User-Agent', 'ghprofiles')
    .catch((err) => {
      console.log(err)
      response.send(err)
    })

  const user_data = JSON.parse(user.text)
  console.log(`Autorizado!! ${user_data.name}`)
  response.send({ user_data, access_data })

})

app.get('/users/:name', async (request, response) => {

  const { name } = request.params
  const { access_token, token_type } = request.query

  const user = await superagent
    .get(`https://api.github.com/users/${name}`)
    .set('Authorization', `${token_type} ${access_token}`)
    .set('User-Agent', 'ghprofiles')
    .catch((err) => { console.log(err) })

  response.send(user.body)
})

app.get('/users/:name/repos', async (request, response) => {

  const { name } = request.params
  const { access_token, token_type, sort, per_page } = request.query

  const user = await superagent
    .get(`https://api.github.com/users/${name}/repos`)
    .set('Authorization', `${token_type} ${access_token}`)
    .set('User-Agent', 'ghprofiles')
    .query({ 'sort': sort, 'per_page': per_page })
    .catch((err) => { console.log(err) })

  response.send(user.body)
})

const PORT = process.env.PORT || 3333
app.listen(PORT,()=>{
  console.log("Servidor online")
});

