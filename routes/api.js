import { Router } from "express";
import { game } from "../app";
import { config } from "../config/config";

//router for "/api..." route
const apiRouter = Router();

//custom middleware handling 'word checking' in external API accessed from within game object [Class GameState]
const checkWord = async (req, res, next) => {
  if (req.user) {
    res.locals.data = await game.checkWord(req.body.letters, req.user);
    res.status(config.http.CREATED);
  } else res.status(config.http.UNAUTHORIZED);
  next();
};

//custom middleware handler for generating random letters accessed from within game object [Class GameState]
const generateLetters = async (req, res, next) => {
  console.log(req.user)
  if (req.user) {
    res.locals.data = game.generateLetters(req.params.size);
    res.status(config.http.CREATED);
  } else res.status(config.http.UNAUTHORIZED);
  next();
};
//custom middleware handler for creating player from within game object [Class GameState]
const createPlayer = async (req, res, next) => {
  console.log(req.body)
  res.locals.data = await game.addPlayer(req.body);
  if (res.locals.data) res.status(config.http.CREATED);
  else {
    res.status(config.http.BAD_REQUEST);
    res.locals.data = {
      message: `User ${req.body.name} already exists. Either login or choose different name.`,
    };
  }
  next();
};

//custom middleware handler for returning game status from within game object [Class GameState]
const gameState = async (req, res, next) => {
  if (req.user) {
    res.locals.data = game.state;
  } else res.status(config.http.UNAUTHORIZED);
  next();
};

//middleware handler - responsible for returning response as JSON
const outputResponse = (req, res, next) => {
  res.json(res.locals.data);
};

//two end-points handling API requests
apiRouter.post("/dict", checkWord, outputResponse);
apiRouter.get("/rndletters/:size", generateLetters, outputResponse);
apiRouter.post("/join", createPlayer, outputResponse);
apiRouter.get("/state", gameState, outputResponse);

export { apiRouter };
