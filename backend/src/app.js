const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");
const { response } = require("express");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// ------------- Start Middlewares ----------------------
function checkRepositoryExists(request, response, next) {
  const { title, url, techs } = request.body;
  
  if (!title || !url || !techs) {
    return response.status(400).json({ error: 'Repository not found on required.' })
  }

  request.repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  return next();
}

function checkRepositoryInArray(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid Id.' })
  }

  const repositoryIndex = repositories.findIndex(reposit => reposit.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' })
  }

  request.repositoryIndex = repositoryIndex;

  return next();
}
// ------------- End Middlewares ----------------------

app.use("/repositories/:id", checkRepositoryInArray);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", checkRepositoryExists, (request, response) => {
  const repository = request.repository;

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id",  (request, response) => {
  const { title, url, techs } = request.body;
  const repositoryIndex = request.repositoryIndex;
  const repository = repositories[repositoryIndex];

  repository.title = title;
  repository.url = url;
  repository.techs = techs;
  repository.likes = repository.likes;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const  repositoryIndex = request.repositoryIndex;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repository = repositories.find(reposit => reposit.id === id);

  repository.likes += 1;

  return response.json(repository);
});

module.exports = app;
