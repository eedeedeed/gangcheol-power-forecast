// src/components/AuthPage.jsx
// 이 파일은 사용자 로그인 및 회원가입 기능을 담당하는 컴포넌트입니다.
// 사용자가 이메일, 비밀번호를 입력하고 제출할 수 있는 폼을 제공합니다.

import React, { useState } from 'react';
import '../styles/auth.css'; // CSS 파일 임포트

function AuthPage({ onLoginSuccess }) { // onLoginSuccess prop을 App.jsx로부터 받습니다.
  // 이메일 입력 필드의 상태를 관리합니다.
  const [email, setEmail] = useState('');
  // 비밀번호 입력 필드의 상태를 관리합니다.
  const [password, setPassword] = useState('');
  // 비밀번호 확인 입력 필드의 상태를 관리합니다. (회원가입 시에만 사용)
  const [confirmPassword, setConfirmPassword] = useState('');
  // 현재 폼이 로그인 모드인지 회원가입 모드인지 나타내는 상태입니다.
  // true이면 로그인 모드, false이면 회원가입 모드입니다.
  const [isLoginMode, setIsLoginMode] = useState(true);
  // 에러 메시지를 관리하는 상태입니다.
  const [errorMessage, setErrorMessage] = useState('');

  // 폼 제출을 처리하는 함수입니다.
  const handleSubmitAuth = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 방지합니다.
    setErrorMessage(''); // 새로운 제출 시 에러 메시지 초기화

    const apiUrl = 'http://localhost:5000/api/users'; // 백엔드 API URL
    const endpoint = isLoginMode ? `${apiUrl}/login` : `${apiUrl}/register`;
    const method = 'POST';
    
    let bodyData;
    if (isLoginMode) {
      // 로그인 시에는 이메일과 비밀번호만 전송
      bodyData = JSON.stringify({ email, password });
    } else {
      // 회원가입 시에는 이메일과 비밀번호, 비밀번호 확인을 전송
      if (!email || !password || !confirmPassword) {
        setErrorMessage('모든 필드를 입력해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
      bodyData = JSON.stringify({ email, password }); // 백엔드에서 username을 받지 않으므로 email, password만 보냄
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyData,
      });

      const data = await response.json();

      if (response.ok) {
        // alert(data.message); // alert 대신 에러 메시지 표시 영역 사용 또는 콘솔 로그
        console.log(data.message);
        if (isLoginMode) { // 로그인 성공 시
          localStorage.setItem('token', data.token); // 토큰 저장
          if (onLoginSuccess) {
            onLoginSuccess(); // App.jsx의 handleLoginSuccess 호출하여 로그인 상태 업데이트
          }
        } else { // 회원가입 성공 시
          // 회원가입 성공 시 자동으로 로그인 폼으로 전환
          setIsLoginMode(true);
          setErrorMessage('회원가입이 성공적으로 완료되었습니다. 이제 로그인해주세요.'); // 성공 메시지 표시
          setEmail(''); // 폼 초기화
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // 서버에서 보낸 오류 메시지를 errorMessage 상태에 설정
        setErrorMessage(data.message || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      setErrorMessage('네트워크 오류 또는 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  return (
    // 인증 페이지 전체를 감싸는 컨테이너입니다. (기존 디자인 유지를 위해 'auth-page-container' 클래스 사용)
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

            {/* 사용자 이름 입력 필드는 제거했습니다. 이메일이 ID 역할을 합니다. */}
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
