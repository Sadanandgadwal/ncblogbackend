
import express from 'express';
import * as controllers from '../controllers/category.controller';
import {isCategoryAuthenticated} from "../middlewares/category.middleware";
const router = express.Router();
// router.use(function (req, res, next) {
//     console.log("inside router");
//     isCategoryAuthenticated(req, res, next);
// });
//To add categories
router.post('/create', controllers.create);
//To fetch all the categories
router.get('/list', controllers.list);
//To delete categories n
router.delete('/:id', controllers.remove);
router.get("/:categoryName", controllers.getBlogsByCategoryName);
router.get("/summaryByCategory",controllers.blogCategorySummary);
export default router;