import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import AuthFormInput from '../components/common/AuthFormInput';
import { login, register, checkDuplicateId } from '../api/auth.api';

const SunIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
	</svg>
);
const MoonIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
);

function AuthPage() {
	const { handleLoginSuccess } = useContext(AuthContext);
	const { theme, toggleTheme } = useContext(ThemeContext);
	const navigate = useNavigate();

	const [isLoginMode, setIsLoginMode] = useState(true);
	const [formData, setFormData] = useState({ ADMIN_ID: '', ADMIN_PASSWORD: '', confirmPassword: '', ADMIN_NAME: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [isIdChecked, setIsIdChecked] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	
	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData(prev => ({ ...prev, [id]: value }));
		if (id === 'ADMIN_ID') setIsIdChecked(false);
	};

	const toggleMode = () => {
		setIsLoginMode(!isLoginMode);
		setErrorMessage('');
		setIsIdChecked(false);
		setFormData({ ADMIN_ID: '', ADMIN_PASSWORD: '', confirmPassword: '', ADMIN_NAME: '' });
	};

	const handleCheckId = async () => {
		if (!formData.ADMIN_ID) return alert('ID를 입력하세요');
		try {
			const res = await checkDuplicateId(formData.ADMIN_ID);
			alert(res.data.exists ? '이미 존재하는 ID입니다.' : '사용 가능한 ID입니다.');
			if (!res.data.exists) setIsIdChecked(true);
		} catch (err) {
			console.error("ID 중복 확인 오류:", err); 
			const errorMessage = err.response?.data?.message || err.message;
			alert(`오류 발생: ${errorMessage}`);
		}
	};

    const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage('');
		setIsLoading(true);
		try {
			if (isLoginMode) {
				const response = await login(formData.ADMIN_ID, formData.ADMIN_PASSWORD);
				
				// ⭐️ 해결책 A: 서버가 응답에 user 객체를 포함해서 보내준다고 가정합니다.
				const userData = response.data; 
				console.log('서버 응답:', response.data);
				console.log("유저데이터확인 : " +  userData);
				console.log('메시지확인 : ' + response.data.admin.ADMIN_ID);
				if (userData) {
					console.log('로그인 성공! ID:', userData.admin.ADMIN_ID);
					handleLoginSuccess(userData);
					navigate('/dashboard');
				} else {
					// 서버가 약속된 user 객체를 보내주지 않은 경우
					console.error('서버 응답에 user 객체가 없습니다. 백엔드 코드를 확인하세요.');
					console.log("패스워드확인 : " +  formData.ADMIN_PASSWORD);
					setErrorMessage('서버 응답 형식이 올바르지 않습니다.');
				}

			} else {
				if (!isIdChecked) throw new Error('ID 중복확인을 해주세요.');
				if (formData.ADMIN_PASSWORD !== formData.confirmPassword) throw new Error('비밀번호가 일치하지 않습니다.');
				await register({ ADMIN_ID: formData.ADMIN_ID, ADMIN_PASSWORD: formData.ADMIN_PASSWORD, ADMIN_NAME: formData.ADMIN_NAME });
				alert('회원가입 완료! 로그인 해주세요.');
				toggleMode();
			}
		} catch (err) {
			setErrorMessage(err.response?.data?.message || err.message);
		} finally {
			setIsLoading(false);
		}
	};

    const handleGuestLogin = () => {
        const guestData = { ADMIN_NAME: '게스트', ADMIN_ID: 'Guest' };
        console.log('로그인 성공! ID:', guestData.ADMIN_ID);
        handleLoginSuccess(guestData);
        navigate('/dashboard');
    };

	return (
		<div id="auth-page" className="auth-page-container">
			<div className="theme-toggle-container">
				<button className="theme-toggle-btn" onClick={toggleTheme} type="button">
					{theme === 'light' ? <MoonIcon /> : <SunIcon />}
					<span>{theme === 'light' ? '다크모드' : '라이트모드'}</span>
				</button>
			</div>
			<div className="auth-card">
				<div className="auth-header"><h4>{isLoginMode ? '로그인' : '회원가입'}</h4></div>
				<div className="auth-body">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="ADMIN_ID" className="form-label">관리자 ID</label>
							<div className="input-with-button">
								<input id="ADMIN_ID" type="text" value={formData.ADMIN_ID} className="form-control" onChange={handleChange} required />
								{!isLoginMode && (<button type="button" onClick={handleCheckId} className={`btn-check-id ${isIdChecked ? 'checked' : ''}`} disabled={isIdChecked}>{isIdChecked ? '✓ 확인완료' : '중복확인'}</button>)}
							</div>
						</div>
						<AuthFormInput id="ADMIN_PASSWORD" label="비밀번호" type="password" value={formData.ADMIN_PASSWORD} onChange={handleChange} />
						{!isLoginMode && (
							<>
								<AuthFormInput id="confirmPassword" label="비밀번호 확인" type="password" value={formData.confirmPassword} onChange={handleChange} />
								<AuthFormInput id="ADMIN_NAME" label="이름" value={formData.ADMIN_NAME} onChange={handleChange} />
							</>
						)}
						{errorMessage && <p className="error-message">{errorMessage}</p>}
						<div className="auth-submit-container">
							<button type="submit" className="btn btn--primary btn--login-width" disabled={isLoading}>{isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}</button>
						</div>
					</form>
				</div>
				<div className="auth-switch-mode">
					<button type="button" onClick={toggleMode} className="btn-text-link">{isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}</button>
				</div>
				<div className="auth-guest-access">
					<div className="auth-divider"><span>또는</span></div>
					<button type="button" className="btn-guest-access" onClick={handleGuestLogin}>🔍 로그인 없이 둘러보기</button>
				</div>
			</div>
		</div>
	);
}

export default AuthPage;