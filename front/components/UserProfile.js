import { Avatar, Button, Card } from 'antd';
import Link from 'next/link';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_OUT_REQUEST } from '../reducers/user';

const UserProfile = () => {
  const { me, isLoggingout } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const onLogOut = useCallback(() => {
    dispatch({
      type: LOG_OUT_REQUEST,
    });
  }, []);
  return (
    <Card
      actions={[
        <div key="twit">
          <Link href={`/user/${me.id}`}>
            <a>
              짹짹
              <br />
              {me.Posts.length}
            </a>
          </Link>
        </div>,
        <div key="followings">
          <Link href="/profile">
            <a>
              팔로잉
              <br />
              {me.Followings.length}
            </a>
          </Link>
        </div>,
        <div key="followings">
          <Link href="/profile">
            <a>
              팔로워
              <br />
              {me.Followers.length}
            </a>
          </Link>
        </div>,
      ]}
    >
      <Card.Meta
        avatar={
          <Link href={`/user/${me.id}`}>
            <a>
              <Avatar>{me.nickname}</Avatar>
            </a>
          </Link>
        }
        title={me.nickname}
      />
      <Button onClick={onLogOut} loading={isLoggingout}>
        로그아웃
      </Button>
    </Card>
  );
};

export default UserProfile;
