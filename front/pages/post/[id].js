// post/[id].js - 다이나믹 라우팅
import React from 'react';
import { END } from 'redux-saga';
import axios from 'axios';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import wrapper from '../../store/configureStore';
import { LOAD_POST_REQUEST } from '../../reducers/post';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';

const { useRouter } = require('next/router');

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  const { singlePost } = useSelector((state) => state.post);
  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        <meta name="description" content={singlePost.content} />
        <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
        <meta property="og:description" content={singlePost.content} />
        <meta
          property="og:image"
          content={
            singlePost.Images[0]
              ? singlePost.Images[0].src
              : 'https://nodebird.com/favicon.ico'
          }
        />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

// 화면을 그리기 전 서버쪽에서 먼저 실행
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  // 쿠키를 여기서 넣어줘야함
  const cookie = context.req ? context.req.headers.cookie : '';
  // 쿠키가 공유되는 오류 해결: 쿠키를 지웠다가 새로 넣어줘야함 (이전의 로그인이 그대로 될 수 도 있음)
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({
    type: LOAD_POST_REQUEST,
    data: context.params.id,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Post;
