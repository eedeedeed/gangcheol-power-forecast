import React, { useState, useContext } from 'react';
import axios from 'axios';
import { login, register, checkDuplicateId } from '../../service/authApi';
import { AppContext } from '../../hooks/AppContext';
import AuthFormInput from './AuthFormInput';

// 다크모드/라이트모드 아이콘 컴포넌트
const SunIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<circle cx="12" cy="12" r="5" />
		<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
	</svg>
);

const MoonIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
);

function AuthPage2({ onLoginSuccess }) {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [formData, setFormData] = useState({
		ADMIN_ID: '',
		ADMIN_PASSWORD: '',
		confirmPassword: '',
		ADMIN_NAME: '',
		BUILDING_ID: ''
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isIdChecked, setIsIdChecked] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// AppContext에서 theme 관련 상태 가져오기
	const { theme, toggleTheme } = useContext(AppContext);

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData(prev => ({ ...prev, [id]: value }));
		if (id === 'ADMIN_ID') setIsIdChecked(false);
	};

	const toggleMode = () => {
		setIsLoginMode(!isLoginMode);
		setErrorMessage('');
		setIsIdChecked(false);
		setFormData({
			ADMIN_ID: '',
			ADMIN_PASSWORD: '',
			confirmPassword: '',
			ADMIN_NAME: '',
			BUILDING_ID: ''
		});
	};

	const handleCheckId = async () => {
		if (!formData.ADMIN_ID) return alert('ID를 입력하세요');
		try {
			const res = await checkDuplicateId(formData.ADMIN_ID);
			console.log('✔️ 서버 응답:', res.data);
			if (res.data.exists) {
				alert('이미 존재하는 ID입니다.');
			} else {
				alert('사용 가능한 ID입니다.');
				setIsIdChecked(true);
			}
		} catch (err) {
			console.error('❌ 중복확인 에러:', err);
			alert('중복 확인 중 오류 발생');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage('');
		setIsLoading(true);

		try {
			if (isLoginMode) {
				await login(formData.ADMIN_ID, formData.ADMIN_PASSWORD);
				onLoginSuccess();
			} else {
				if (!isIdChecked) throw new Error('ID 중복확인을 해주세요.');
				if (formData.ADMIN_PASSWORD !== formData.confirmPassword)
					throw new Error('비밀번호가 일치하지 않습니다.');

				await register({
					ADMIN_ID: formData.ADMIN_ID,
					ADMIN_PASSWORD: formData.ADMIN_PASSWORD,
					ADMIN_NAME: formData.ADMIN_NAME,
					BUILDING_ID: formData.BUILDING_ID === '' ? null : Number(formData.BUILDING_ID),
				});

				alert('회원가입 완료!');
				onLoginSuccess();
			}
		} catch (err) {
			setErrorMessage(err.response?.data?.message || err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// 🔥 게스트 접근 핸들러 추가
	const handleGuestAccess = () => {
		onLoginSuccess();
	};

	return (
		<div id="auth-page" className={`auth-page-container ${theme}`}>
			{/* 테마 토글 버튼 추가 */}
			<div className="theme-toggle-container">
				<button
					className="theme-toggle-btn"
					onClick={toggleTheme}
					type="button"
				>
					{theme === 'light' ? <MoonIcon /> : <SunIcon />}
					<span>{theme === 'light' ? '다크모드' : '라이트모드'}</span>
				</button>
			</div>

			<div className="auth-card">
				<div className="auth-header">
					<h4>{isLoginMode ? '로그인' : '회원가입'}</h4>
				</div>

				<div className="auth-body">
					<form onSubmit={handleSubmit}>
						{/* 🔥 관리자 ID 입력 필드 + 중복확인 버튼 */}
						<div className="form-group">
							<label htmlFor="ADMIN_ID" className="form-label">관리자 ID</label>
							<div className="input-with-button">
								<input
									id="ADMIN_ID"
									type="text"
									value={formData.ADMIN_ID}
									className="form-control"
									onChange={handleChange}
									required
								/>
								{!isLoginMode && (
									<button
										type="button"
										onClick={handleCheckId}
										className={`btn-check-id ${isIdChecked ? 'checked' : ''}`}
										disabled={isIdChecked}
									>
										{isIdChecked ? '✓ 확인완료' : '중복확인'}
									</button>
								)}
							</div>
						</div>

						<AuthFormInput
							id="ADMIN_PASSWORD"
							label="비밀번호"
							type="password"
							value={formData.ADMIN_PASSWORD}
							onChange={handleChange}
						/>

						{!isLoginMode && (
							<>
								<AuthFormInput
									id="confirmPassword"
									label="비밀번호 확인"
									type="password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
								<AuthFormInput
									id="ADMIN_NAME"
									label="이름"
									value={formData.ADMIN_NAME}
									onChange={handleChange}
								/>
							</>
						)}

						{errorMessage && <p className="error-message">{errorMessage}</p>}

						<div className="auth-submit-container">
							<button type="submit" className="btn btn--primary btn--login-width" disabled={isLoading}>
								{isLoading ? (isLoginMode ? '로그인 중...' : '회원가입 중...') : (isLoginMode ? '로그인' : '회원가입')}
							</button>
						</div>
					</form>
				</div>
				<div className="auth-switch-mode">
					<button type="button" onClick={toggleMode} className="btn-text-link">
						{isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
					</button>
				</div>

				{/* 🔥 게스트 접근 버튼 */}
				<div className="auth-guest-access">
					<div className="auth-divider">
						<span>또는</span>
					</div>
					<button
						type="button"
						onClick={handleGuestAccess}
					>
						바로 접속
					</button>
				</div>
			</div>
		</div>
	);
}

export default AuthPage2;
