import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import { END } from 'redux-saga';
import axios from 'axios';
import useSWR from 'swr';

import AppLayout from '../components/AppLayout';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  const [followingsLimit, setFollowingsLimit] = useState(3);
  const [followersLimit, setFollowersLimit] = useState(3);
  const { data: followingsData, error: followingError } = useSWR(
    `http://localhost:4000/user/followings?limit=${followingsLimit}`,
    fetcher
  );
  const { data: followersData, error: followerError } = useSWR(
    `http://localhost:4000/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { me } = useSelector((state) => state.user);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   });
  // }, []);
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);
  if (!me) {
    return '내 정보 로딩 중...';
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return '팔로잉/팔로워 로딩 중 에러가 발생했습니다.';
  }

  return (
    <AppLayout>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <NicknameEditForm />
      <FollowList
        header="팔로잉"
        data={followingsData}
        onClickMore={loadMoreFollowings}
        loading={!followingError && !followingsData}
      />
      <FollowList
        header="팔로워"
        data={followersData}
        onClickMore={loadMoreFollowers}
        loading={!followerError && !followersData}
      />
      {/* <FollowList header="팔로잉" data={me.Followings} />
      <FollowList header="팔로워" data={me.Followers} /> */}
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Profile;
