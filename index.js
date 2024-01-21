const express = require('express');     //Importando o express
const cors = require('cors');
const bd = require('./bd');     //importando a conexão com o banco de dados

const app = express();                      //Iniciando a aplicação com Express.js / servidor
const port = 3000;


app.use(express.json());        //transforma o body em json
app.use(cors());

app.get('/', (request, response) => {
    response.send('Servidor funcionando');
});


app.get('/filmes/:pagina', async (req, res) =>{
    let pagina = req.params.pagina;
    let sql = await bd.query(
        `SELECT * FROM filmes 
            where id > ? and id <= ?`,
        [(pagina-1)*10, pagina*10]);

    return res.status(200).json(sql);
})


app.get('/filme/:id', async (req, res) =>{
    let id = req.params.id;
    let sql = await bd.query(
        `SELECT filmes.*, GROUP_CONCAT(DISTINCT generos.titulo) "Genero", GROUP_CONCAT(DISTINCT atores.titulo) "Atores"
            FROM filmes_generos,generos, filmes,  atores_filmes, atores
            WHERE filmes_generos.filme_id = filmes.id and filmes_generos.genero_id = generos.id and atores_filmes.ator_id = atores.id and atores_filmes.filme_id = filmes.id
            and filmes.id = ?
            group by filmes.id`,
        [id]);

    return res.status(200).json(sql);
})



app.get('/filmes/busca/:palavra', async (req, res) =>{
    let palavra = req.params.palavra;
    let sql = await bd.query(
        `SELECT filmes.*, GROUP_CONCAT(DISTINCT generos.titulo) "Genero"
        FROM filmes
        JOIN filmes_generos ON filmes_generos.filme_id = filmes.id
        JOIN generos ON filmes_generos.genero_id = generos.id
        WHERE filmes.titulo LIKE "%${palavra}%" or filmes.sinopse LIKE "%${palavra}%"
        group by filmes.id`);

    return res.status(200).json(sql);
})

app.get('/generos/:genero', async (req, res) =>{
    let genero = req.params.genero;
    let sql = await bd.query(
        `SELECT generos.titulo "Genero", GROUP_CONCAT(filmes.titulo) Filmes
        FROM filmes_generos
        JOIN filmes ON filmes_generos.filme_id = filmes.id
        JOIN generos ON filmes_generos.genero_id = generos.id
        WHERE generos.titulo like "%${genero}%"
        group by generos.titulo`);

    return res.status(200).json(sql);
})


app.get('/ator/:id', async (req, res) =>{
    let id = req.params.id;
    let sql = await bd.query(
        `SELECT atores.titulo Ator, GROUP_CONCAT(filmes.titulo) Filmes 
        FROM filmes
        JOIN atores_filmes ON atores_filmes.filme_id = filmes.id
        JOIN atores ON atores_filmes.ator_id = atores.id
        WHERE atores.id = ?
        group by atores.titulo`, [id]);

    return res.status(200).json(sql);
})


app.get('/atores/busca/:palavra', async (req, res) =>{
    let palavra = req.params.palavra;
    let sql = await bd.query(
        `SELECT 	atores.titulo Ator, GROUP_CONCAT(filmes.titulo) Filmes
        FROM filmes
        JOIN atores_filmes ON atores_filmes.filme_id = filmes.id
        JOIN atores ON atores_filmes.ator_id = atores.id
        WHERE atores.titulo like "%${palavra}%"
        GROUP by atores.titulo`);

    return res.status(200).json(sql);
})


app.post('/atores', async (req, res) =>{
    let titulo = req.body.titulo

    try {
        let sql = await bd.query(
        `INSERT INTO atores (titulo) VALUES
        ("${titulo}")`);
        return res.send(sql);

    } catch (error) {
        return res.send(error);
    }
})

app.put('/atores/:id', async (req, res) =>{
    let id = req.params.id;
    let titulo = req.body.titulo;

    try {
        let sql = await bd.query(
        `update atores set titulo = "${titulo}" where id = ${id}`);
        return res.send(sql);

    } catch (error) {
        return res.send(error);
    }
})

app.delete('/atores/:id', async (req, res) =>{
    let id = req.params.id;

    try {
        let sql = await bd.query(
        `DELETE a, af
        FROM atores AS a
        LEFT JOIN atores_filmes AS af ON a.id = af.ator_id
        WHERE a.id = ${id};        
        `);
        return res.send(sql);

    } catch (error) {
        return res.send(error);
    }
})

app.post('/participacoes/:idAtor/:idFilme', async (req, res) =>{
    let idAtor = req.params.idAtor;
    let idFilme = req.params.idFilme

    try {
        let sql = await bd.query(
        `INSERT INTO atores_filmes (ator_id, filme_id) VALUES
        (${idAtor}, ${idFilme})`);
        return res.send(sql);

    } catch (error) {
        return res.send(error);
    }
})

app.delete('/participacoes/:idAtor/:idFilme', async (req, res) =>{
    let idAtor = req.params.idAtor;
    let idFilme = req.params.idFilme;

    try {
        let sql = await bd.query(
        `DELETE FROM atores_filmes
        WHERE atores_filmes.ator_id = ${idAtor} and atores_filmes.filme_id = ${idFilme}      
        `);
        return res.send(sql);

    } catch (error) {
        return res.send(error);
    }
})








//direcionando a porta ao servidor
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
});