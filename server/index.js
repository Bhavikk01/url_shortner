const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const monk = require('monk');   
const yup = require('yup');
const { nanoid } = require('nanoid');

const app = express();


const db = monk('localhost/url_shortner');
const urls = db.get('urls');
urls.createIndex('slug');

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

app.use((error, req, res, next) => {
    if (error.status) {
      res.status(error.status);
    } else {
      res.status(500);
    }
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});


const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[a-z0-9_-]/i),
    url: yup.string().trim().url().required()
})


app.post('/url',async  (req, res, next) => {
    let {slug, url} = req.body;
    try{

        await schema.validate({
            slug,
            url 
        });

        if (!slug) {
            slug = nanoid(5);
          } else {
            const existing = await urls.findOne({ slug });
            console.log(existing);
            if (existing) {
              throw new Error('Slug in use. 🍔');
            }
          }

        slug = slug.toLowerCase();
        newUrl = {
            slug,
            url,
        };

        const created = await urls.insert(newUrl);
        res.json(created);

    }catch(error){
        next(error);
    }
});


app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params;
    try {
      const url = await urls.findOne({ slug });
      if (url) {
        return res.redirect(url.url);
      }
      return res.status(404);
    } catch (error) {
      return res.status(404);
    }
  });

const port = process.env.port || 2000;

app.listen(port, () =>{
    console.log("Server started successfully");
})