import { useApi } from "../hooks/useApi";
import { BACKEND_URL } from "../constants/base";
import {
  WebsitePost,
  GetPostsParams,
  PostsResponse,
  PostLikeResponse,
  getPostResponse,
} from "../types/posts";

export const useWebsitePostsService = (websiteId?: string) => {
  const {
    get,
    post,
    delete: del,
  } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true, websiteVersion: "v2" });

  const getPosts = async (data: {
    websiteId: string;
    params?: GetPostsParams;
  }): Promise<PostsResponse> => {
    const response = await get<PostsResponse>(
      `/posts`,
      { params: data.params },
      true
    );

    return response.data;
  };

  const getPost = async (data: {
    websiteId: string;
    postId: string;
  }): Promise<WebsitePost> => {
    const response = await get<getPostResponse>(
      `/posts/${data.postId}`,
      {},
      true
    );
    return response.data.data;
  };

  const likePost = async (data: {
    websiteId: string;
    postId: string;
  }): Promise<PostLikeResponse> => {
    const response = await post<PostLikeResponse>(
      `/posts/${data.postId}/like`,
      {},
      {},
      true
    );
    return response.data;
  };

  const unlikePost = async (data: {
    websiteId: string;
    postId: string;
  }): Promise<PostLikeResponse> => {
    const response = await del<PostLikeResponse>(
      `/posts/${data.postId}/like`,
      {},
      true
    );
    return response.data;
  };

  return {
    getPosts,
    getPost,
    likePost,
    unlikePost,
  };
};
