const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Configurar Express para servir archivos estáticos
app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
//Midleware
function NotNull(req,res,next){

    if(req.body.ci !=""){
        next()
    }else{
        res.status(403).send(`La cédula de identidad no puede estar vacío ${req.url}`)
    }
    if(req.body.nombre !=""){
        next()
    }else{
        res.status(403).send(`El nombre  no puede estar vacío ${req.url}`)
    }
    if(req.body.curso !=""){
        next()
    }else{
        res.status(403).send(`El curso  no puede estar vacío ${req.url}`)
    }
    // Se agrega el middleware en la aplicación.
    app.use(NotNull);
}*/


// Listar estudiantes
app.get('/estudiantes', (req, res) => {
    const filePath = path.join(__dirname, 'files', 'estudiantes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo de estudiantes.');
        }

        let estudiantes = [];
        if (data) {
            estudiantes = JSON.parse(data);
        }

        res.json(estudiantes);
    });
});

// Agregar estudiante
app.post('/agregar', (req, res) => {
    const { ci, nombre, edad, curso } = req.body;

    if (!ci || !nombre || !edad || !curso) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    const nuevoEstudiante = { ci, nombre, edad, curso };

    const filePath = path.join(__dirname, 'files', 'estudiantes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        let estudiantes = [];

        if (!err && data) {
            estudiantes = JSON.parse(data);
        }

        const index = estudiantes.findIndex(est => est.ci === ci);

        if (index !== -1) {
            return res.status(400).send('Estudiante con la misma CI ya existe.');
        }

        estudiantes.push(nuevoEstudiante);

        fs.writeFile(filePath, JSON.stringify(estudiantes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error guardando el estudiante.');
            }
            res.status(200).send('Estudiante agregado exitosamente.');
        });
    });
});

//Eliminar estudiante
app.delete('/eliminar/:ci', (req, res) => {
    const { ci } = req.params;
    const filePath = path.join(__dirname, 'files', 'estudiantes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo de estudiantes.');
        }

        let estudiantes = JSON.parse(data);
        estudiantes = estudiantes.filter(est => est.ci !== ci);

        fs.writeFile(filePath, JSON.stringify(estudiantes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error eliminando el estudiante.');
            }
            res.status(200).send('Estudiante eliminado exitosamente.');
        });
    });
});

// Buscar un estudiante
app.get('/estudiante/:ci', (req, res) => {
    const { ci } = req.params;
    const filePath = path.join(__dirname, 'files', 'estudiantes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo de estudiantes.');
        }

        let estudiantes = [];
        if (data) {
            estudiantes = JSON.parse(data);
        }

        const estudiante = estudiantes.find(est => est.ci === ci);

        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado.');
        }

        res.json(estudiante);
    });
});

// Modificar estudiante
app.post('/modificar/:ci', (req, res) => {
    const { ci } = req.params;
    const { nombre, edad, curso } = req.body;

    const filePath = path.join(__dirname, 'files', 'estudiantes.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo de estudiantes.');
        }

        let estudiantes = JSON.parse(data);
        const index = estudiantes.findIndex(est => est.ci === ci);

        if (index === -1) {
            return res.status(404).send('Estudiante no encontrado.');
        }

        estudiantes[index] = { ci, nombre, edad, curso };

        fs.writeFile(filePath, JSON.stringify(estudiantes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error guardando la modificación.');
            }
            res.status(200).send('Estudiante modificado exitosamente.');
        });
    });
});

// Iniciar el servidor localhost:3000
app.listen(port, () => {
    console.log(`Servidor funcionando en http://localhost:${port}`);
});
