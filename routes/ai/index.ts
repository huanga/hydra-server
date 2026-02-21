import { summarizePostDetails } from "./summarizePostDetails";
import { summarizeComments } from "./summarizeComments";
import { filterPosts } from "./filterPosts";
import { createEmbedding } from "./createEmbedding";
import { askQuestion } from "./askQuestion";
import { translatePost } from "./translatePost";
import { translateComment } from "./translateComments";

export default {
  "/api/ai/summarizePostDetails": {
    POST: summarizePostDetails,
  },
  "/api/ai/summarizeComments": {
    POST: summarizeComments,
  },
  "/api/ai/translatePost": {
    POST: translatePost,
  },
  "/api/ai/translateComment": {
    POST: translateComment,
  },
  "/api/ai/filterPosts": {
    POST: filterPosts,
  },
  "/api/ai/createEmbedding": {
    POST: createEmbedding,
  },
  "/api/ai/askQuestion": {
    POST: askQuestion,
  },
};
