import React, { useState, useEffect, useMemo } from 'react';
import { useOktaAuth } from '@okta/okta-react';

import RenderVotingPage from './RenderVotingPage';
import { connect } from 'react-redux';

import { getGameVotes } from '../../../api';

function VotingPageContainer({ LoadingComponent, ...props }) {
  const { authState, authService } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  // eslint-disable-next-line
  const [memoAuthService] = useMemo(() => [authService], []);
  const [faceoff, setFaceoff] = useState();


  useEffect(() => {
    let isSubscribed = true;

    memoAuthService
      .getUser()
      .then(info => {
        // if user is authenticated we can use the authService to snag some user info.
        // isSubscribed is a boolean toggle that we're using to clean up our useEffect.
        if (isSubscribed) {
          setUserInfo(info);
        }
      })
      .catch(err => {
        isSubscribed = false;
        return setUserInfo(null);
      });
    return () => (isSubscribed = false);
  }, [memoAuthService]);

  useEffect(() => {
    getGameVotes(authState, props.squad[0].SquadID, props.child.memberId).then(res => {
      console.log(res, res.length, 'from api call');
      if (res.length === 0) {
        setFaceoff(props.squad[3]);
        console.log(props.squad[3]);
      } else if (res.length === 1) {
        setFaceoff(props.squad[2]);
        console.log(props.squad[2]);
      } else if (res.length === 2) {
        setFaceoff(props.squad[1]);
        console.log(props.squad[1]);
      } else {
        setFaceoff(props.squad[0]);
        console.log(props.squad[0]);
      }
      console.log(faceoff);

    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(faceoff);

  return (
    <>
      {authState.isAuthenticated && !userInfo && (
        <LoadingComponent message="Loading..." />
      )}
      {authState.isAuthenticated && userInfo && faceoff && (
        <RenderVotingPage
          {...props}
          faceoff={faceoff}
          userInfo={userInfo}
          authService={authService}
        />
      )}
    </>
  );
}

export default connect(
  state => ({
    child: state.child,
    squad: state.squad,
  }),
  {}
)(VotingPageContainer);
