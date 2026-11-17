import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import dashboardUrl from './landing-dashboard.png';
import logoUrl from './landing-logo.svg';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="passhufs-landing">

    <header className="header">
      <Link to={PATHS.landing} aria-label="PassHUFS 홈"><img src={logoUrl} alt="PassHUFS" /></Link>
      <nav aria-label="계정">
        <Link to={PATHS.login}>로그인</Link>
        <Link className="button" to={PATHS.signup}>회원가입</Link>
      </nav>
    </header>
    <main>
      <div className="intro">
        <section className="hero wrap">
          <div>
            <p className="badge">● 한국외대 학생 맞춤 지원 자격 확인</p>
            <h1>복잡한 지원 조건,<br />내가 가능한지 확인하세요</h1>
            <p>학점과 어학 성적을 입력하면 지원 자격을 쉽고 빠르게 알 수 있어요.</p>
            <Link className="button cta start-button" to={PATHS.login}>시작하기 <span aria-hidden="true">→</span></Link>
          </div>
          <img className="preview" src={dashboardUrl} alt="PassHUFS 대시보드 예시: 내 지원 조건, 협정교, 지원 계획 화면" width="882" height="496" />
        </section>
        <section className="section features" aria-labelledby="features-title">
          <p className="badge">주요 기능</p>
          <h2 id="features-title">지원 준비를 더 간단하게</h2>
          <p className="muted">꼭 필요한 정보만 입력하고 한눈에 확인해요.</p>
          <div className="cards">
            <article><span className="number" aria-hidden="true">01</span><h3>간편한 조건 입력</h3><p>누적 학점과 보유한 어학 성적만 간단하게 입력해요.</p><footer>✦ 빠른 간소화 입력폼</footer></article>
            <article><span className="number" aria-hidden="true">02</span><h3>빠른 자격 확인</h3><p>내 조건으로 지원할 수 있는지 바로 확인해요.</p><footer>✦ 실시간 요건 매칭</footer></article>
            <article><span className="number" aria-hidden="true">03</span><h3>내 정보를 한눈에</h3><p>등록한 학점과 어학 성적을 한 화면에서 함께 확인할 수 있어요.</p><footer>✦ 원스톱 지원 현황</footer></article>
          </div>
        </section>
      </div>
      <section className="section guide" aria-labelledby="guide-title">
        <p className="badge">이용방법</p>
        <h2 id="guide-title">3단계면 충분해요</h2>
        <p className="muted">꼭 필요한 정보만 입력하고 한눈에 확인해요.</p>
        <ol className="steps">
          <li><span className="step-number">1</span><h3>학교 메일로 가입</h3><p>재학생 인증을 위해 학교 메일을 인증해요.</p></li>
          <li><span className="step-number">2</span><h3>지원 조건 입력</h3><p>누적 학점과 어학 성적을 입력해요.</p></li>
          <li><span className="step-number">3</span><h3>자격 확인</h3><p>내 조건으로 지원 가능한 여부를 확인해요.</p></li>
        </ol>
      </section>
      <section className="section closing" aria-labelledby="closing-title">
        <h2 id="closing-title">지금 내 지원 자격을 확인하세요</h2>
        <p className="muted">간단한 가입과 정보 입력으로 바로 확인해 보세요.</p>
        <Link className="button cta start-button" to={PATHS.login}>시작하기 <span aria-hidden="true">→</span></Link>
      </section>
    </main>
    </div>
  );
}
