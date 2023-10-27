const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
const { initializeApp, credential } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');


// Configuração do Firebase Admin
const serviceAccount = require('./nodefirebase-8176f-firebase-adminsdk-4o2xp-44b7d48ec4.json');
var admin = require("firebase-admin");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = getFirestore();

// Configuração do Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rotas
app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

app.get("/consulta", function (req, res) {
  const collection = db.collection("agendamentos");
  collection.get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const documentId = doc.id;
        const documentData = doc.data();
        data.push({ id: documentId, ...documentData });
      });
      res.render("consulta", { post: data });
    })
    .catch((error) => {
      console.error("Erro ao consultar agendamentos: ", error);
    });
});

app.get("/editar/:id", function (req, res) {
  const collection = db.collection("agendamentos");
  const documentId = req.params.id;
  const documentRef = collection.doc(documentId);

  documentRef.get()
    .then((doc) => {
      if (doc.exists) {
        const data = { id: documentId, ...doc.data() };
        res.render('editar', data);
      } else {
        console.log("Documento não encontrado.");
      }
    })
    .catch((error) => {
      console.error("Ocorreu um erro ao buscar o documento: ", error);
    });
});

app.get("/excluir/:id", function (req, res) {
  const collection = db.collection("agendamentos");
  const documentId = req.params.id;

  collection.doc(documentId).delete()
    .then(() => {
      console.log("Documento excluído com sucesso!");
      res.redirect("/consulta");
    })
    .catch((error) => {
      console.error("Erro ao excluir o documento: ", error);
    });
});

app.post("/atualizar", function (req, res) {
  const collection = db.collection("agendamentos");
  const id = req.query.id;

  const updateData = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  };

  // Verificar se o ID é uma string válida e não está vazio
  if (id && typeof id === "string" && id.trim() !== "") {
    collection.doc(id).update(updateData)
      .then(() => {
        console.log("Documento atualizado com sucesso!");
        res.redirect("/consulta");
      })
      .catch((error) => {
        console.error("Erro ao atualizar o documento: ", error);
      });
  } else {
    console.error("ID de documento inválido ou ausente no corpo da solicitação.");
  }
});

app.post("/cadastrar", function (req, res) {
  const collection = db.collection('agendamentos');
  const novoAgendamento = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  };

  collection.add(novoAgendamento)
    .then(() => {
      console.log('Documento adicionado com sucesso');
      res.redirect('/');
    })
    .catch((error) => {
      console.error('Erro ao adicionar documento:', error);
      res.status(500).send('Erro ao adicionar documento');
    });
});

app.listen(8081, function () {
  console.log("Servidor ativo!")
});
