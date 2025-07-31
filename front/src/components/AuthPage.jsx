// src/components/AuthPage.jsx
// 이 파일은 사용자 로그인 및 회원가입 기능을 담당하는 컴포넌트입니다.
// 사용자가 이메일, 비밀번호, 사용자 이름을 입력하고 제출할 수 있는 폼을 제공합니다.

import React, { useState } from 'react';

function AuthPage({ setActiveTab, onLoginSuccess }) { // onLoginSuccess prop 추가
  // 이메일 입력 필드의 상태를 관리합니다.
  const [email, setEmail] = useState('');
  // 비밀번호 입력 필드의 상태를 관리합니다.
  const [password, setPassword] = useState('');
  // 비밀번호 확인 입력 필드의 상태를 관리합니다. (회원가입 시에만 사용)
  const [confirmPassword, setConfirmPassword] = useState('');
  // 사용자 이름 입력 필드의 상태를 관리합니다. (회원가입 시에만 사용)
  const [username, setUsername] = useState('');
  // 현재 폼이 로그인 모드인지 회원가입 모드인지 나타내는 상태입니다.
  // true이면 로그인 모드, false이면 회원가입 모드입니다.
  const [isLoginMode, setIsLoginMode] = useState(true);
  // 에러 메시지를 관리하는 상태입니다.
  const [errorMessage, setErrorMessage] = useState('');

  // 폼 제출을 처리하는 함수입니다.
  const handleSubmitAuth = (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 방지합니다.
    setErrorMessage(''); // 새로운 제출 시 에러 메시지 초기화

    if (isLoginMode) {
      // 로그인 모드일 때의 로직입니다.
      if (!email || !password) {
        setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }
      // 실제 로그인 API 호출 로직이 여기에 들어갑니다.
      // 여기서는 임시 계정으로 'test@example.com'과 'password'를 사용합니다.
      console.log('로그인 시도:', { email, password });
      
      // 비동기 로그인 시뮬레이션
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') {
          console.log('로그인 성공!');
          onLoginSuccess(); // 로그인 성공 시 부모 컴포넌트에 알림
        } else {
          setErrorMessage('로그인 정보가 올바르지 않습니다. (임시 계정: test@example.com / password)');
        }
      }, 500);
    } else {
      // 회원가입 모드일 때의 로직입니다.
      if (!username || !email || !password || !confirmPassword) {
        setErrorMessage('모든 필드를 입력해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
      // 실제 회원가입 API 호출 로직이 여기에 들어갑니다.
      // 여기서는 간단히 성공으로 가정하고 onLoginSuccess를 호출합니다.
      console.log('회원가입 시도:', { username, email, password });
      
      // 비동기 회원가입 시뮬레이션
      setTimeout(() => {
        console.log('회원가입 성공!');
        onLoginSuccess(); // 회원가입 성공 시 부모 컴포넌트에 알림
      }, 500);
    }
  };

  return (
    // 인증 페이지 전체를 감싸는 컨테이너입니다.
    <div id="auth-page" className="auth-page-container">
      {/* 로그인/회원가입 폼을 담는 카드 형태의 UI 요소입니다. */}
      <div className="auth-card">
        {/* 카드 헤더 부분입니다. 현재 모드에 따라 '로그인' 또는 '회원가입' 텍스트를 표시합니다. */}
        <div className="auth-header">
          <h4>{isLoginMode ? '로그인' : '회원가입'}</h4>
        </div>
        {/* 카드 본문 부분으로, 실제 폼이 포함됩니다. */}
        <div className="auth-body">
          <form onSubmit={handleSubmitAuth}>
            {/* 에러 메시지가 있을 경우 표시합니다. */}
            {errorMessage && (
              <div className="alert-card alert-card--warning" style={{marginBottom: '16px'}}>
                <div className="alert-message">{errorMessage}</div>
              </div>
            )}

            {/* 회원가입 모드일 때만 사용자 이름 입력 필드를 렌더링합니다. */}
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="auth-username" className="form-label">사용자 이름</label>
                <input
                  type="text"
                  id="auth-username"
                  className="form-control"
                  placeholder="사용자 이름을 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLoginMode} // 회원가입 모드일 때만 필수 필드로 설정
                />
              </div>
            )}
            {/* 이메일 입력 필드입니다. 로그인/회원가입 모드 모두에서 사용됩니다. */}
            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">이메일</label>
              <input
                type="email"
                id="auth-email"
                className="form-control"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // 필수 필드
              />
            </div>
            {/* 비밀번호 입력 필드입니다. 로그인/회원가입 모드 모두에서 사용됩니다. */}
            <div className="form-group">
              <label htmlFor="auth-password" className="form-label">비밀번호</label>
              <input
                type="password"
                id="auth-password"
                className="form-control"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // 필수 필드
              />
            </div>
            {/* 회원가입 모드일 때만 비밀번호 확인 입력 필드를 렌더링합니다. */}
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="auth-confirmPassword" className="form-label">비밀번호 확인</label>
                <input
                  type="password"
                  id="auth-confirmPassword"
                  className="form-control"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLoginMode} // 회원가입 모드일 때만 필수 필드로 설정
                />
              </div>
            )}
            {/* 폼 제출 버튼입니다. */}
            <div className="auth-submit-container">
              <button type="submit" className="btn btn--primary btn--full-width">
                {isLoginMode ? '로그인' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
        {/* 모드 전환 텍스트 링크입니다. */}
        <div className="auth-switch-mode">
          <button type="button" className="btn-text-link" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

