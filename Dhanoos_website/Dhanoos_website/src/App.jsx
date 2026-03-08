import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import './app.css';

function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);
  return [ref, isVisible];
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <div className="nav__brand">SUCCESS<span>ACADEMY</span></div>
        <button className="nav__cta" onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}>
          Register Now
        </button>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__noise"></div>
      {/* Floating background words — opacity raised for visible whitish look on grey bg */}
      <div className="hero__bg-words" aria-hidden="true">
        <span className="hero__bg-word" style={{top:'8%',left:'-2%',fontSize:'clamp(2rem,7vw,5.5rem)',opacity:0.18,transform:'rotate(-8deg)'}}>EXCELLENCE</span>
        <span className="hero__bg-word" style={{top:'15%',right:'0%',fontSize:'clamp(1.5rem,5vw,4rem)',opacity:0.16,transform:'rotate(5deg)'}}>GUIDANCE</span>
        <span className="hero__bg-word" style={{top:'55%',left:'-1%',fontSize:'clamp(1.2rem,4vw,3rem)',opacity:0.14,transform:'rotate(-4deg)'}}>KNOWLEDGE</span>
        <span className="hero__bg-word" style={{top:'65%',right:'2%',fontSize:'clamp(1.5rem,5vw,4rem)',opacity:0.16,transform:'rotate(7deg)'}}>SUCCESS</span>
        <span className="hero__bg-word" style={{top:'78%',left:'20%',fontSize:'clamp(1rem,3vw,2.5rem)',opacity:0.13,transform:'rotate(-3deg)'}}>ACHIEVEMENT</span>
        <span className="hero__bg-word" style={{top:'30%',left:'75%',fontSize:'clamp(1rem,3.5vw,3rem)',opacity:0.14,transform:'rotate(10deg)'}}>RESULTS</span>
      </div>

      <div className="hero__inner">
        <div className="hero__slogan">WHERE EXCELLENCE MEETS GUIDANCE</div>
        <h1 className="hero__wordmark">
          <span className="hero__wordmark-success">SUCCESS</span>
          <span className="hero__wordmark-academy">ACADEMY</span>
        </h1>
        <div className="hero__location">In <strong>Puducherry</strong></div>

        <div className="hero__bottom">
          <p className="hero__desc">
            Coaching for 10th, 11th &amp; 12th standard students.<br />
            Maths · Science · Physics · Chemistry
          </p>
          <div className="hero__btns">
            <button className="hero__btn hero__btn--primary" onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}>
              Apply Now
            </button>
            <button className="hero__btn hero__btn--ghost" onClick={() => document.querySelector('.section--light')?.scrollIntoView({ behavior: 'smooth' })}>
              Our Achievements
            </button>
          </div>
        </div>
      </div>

      <div className="hero__stats">
        <div className="hero__stat"><span className="hero__stat-num">500+</span><span className="hero__stat-label">Students Guided</span></div>
        <div className="hero__stat-divider"></div>
        <div className="hero__stat"><span className="hero__stat-num">98%</span><span className="hero__stat-label">Pass Rate</span></div>
        <div className="hero__stat-divider"></div>
        <div className="hero__stat"><span className="hero__stat-num">10+</span><span className="hero__stat-label">Years Experience</span></div>
      </div>
    </section>
  );
}

// Achievements — live from Firestore via API, with year filter
function AchievementsSection() {
  const [activeTab, setActiveTab] = useState('10th');
  const [activeYear, setActiveYear] = useState('all');
  const [ref, visible] = useScrollReveal();
  const [allPerformers, setAllPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/top-performers')
      .then(r => r.json())
      .then(data => { if (data.success) setAllPerformers(data.performers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allYears = [...new Set(allPerformers.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);

  const displayed = allPerformers.filter(p =>
    p.std === activeTab && (activeYear === 'all' || p.year === activeYear)
  );

  const handleTabChange = (tab) => { setActiveTab(tab); setActiveYear('all'); };

  return (
    <section className="section section--light" ref={ref}>
      <div className={`reveal ${visible ? 'reveal--in' : ''}`}>
        <div className="section__head">
          <div className="section__label">Top Performers</div>
          <h2 className="section__title">OUR<br />ACHIEVEMENTS.</h2>
        </div>

        <div className="tabs">
          {['10th', '11th', '12th'].map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)} className={`tabs__btn ${activeTab === tab ? 'tabs__btn--active' : ''}`}>
              {tab} Std
            </button>
          ))}
        </div>

        {allYears.length > 0 && (
          <div className="year-filter">
            <button onClick={() => setActiveYear('all')} className={`year-filter__btn ${activeYear === 'all' ? 'year-filter__btn--active' : ''}`}>
              All Years
            </button>
            {allYears.map(yr => (
              <button key={yr} onClick={() => setActiveYear(yr)} className={`year-filter__btn ${activeYear === yr ? 'year-filter__btn--active' : ''}`}>
                {yr}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="achieve-empty">Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="achieve-empty">No top performers listed yet.</div>
        ) : (
          <div className="cards">
            {displayed.map((s, i) => (
              <div key={s.id || i} className="card card--achieve" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="card__score">{s.total}</div>
                <div className="card__body">
                  <div className="card__name">{s.name}</div>
                  <div className="card__school">{s.school}</div>
                  <div className="card__marks">
                    {s.maths && <span>Maths: {s.maths}</span>}
                    {s.science && <span>Science: {s.science}</span>}
                    {s.physics && <span>Physics: {s.physics}</span>}
                    {s.chemistry && <span>Chemistry: {s.chemistry}</span>}
                  </div>
                  <div className="card__year">{s.year}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [ref, visible] = useScrollReveal();
  const testimonials = [
    { name: 'Ananya Krishnan', standard: '12th', school: 'Holy Angels School', feedback: 'Success Academy transformed my understanding of mathematics. The personalized attention helped me achieve my dream score.' },
    { name: 'Rohan Patel', standard: '10th', school: 'Kendriya Vidyalaya', feedback: "The faculty here doesn't just teach; they inspire. Every concept is explained with such clarity that even tough topics become easy." },
    { name: 'Lakshmi Nair', standard: '11th', school: 'DAV Public School', feedback: 'Joining Success Academy was the best decision for my academic journey. The supportive environment boosted my confidence tremendously.' },
    { name: 'Aditya Sharma', standard: '12th', school: 'Ryan International', feedback: 'The systematic approach and regular practice sessions prepared me thoroughly for board exams. Highly recommended!' },
    { name: 'Kavya Reddy', standard: '10th', school: 'Delhi Public School', feedback: 'What sets Success Academy apart is their dedication to each student. Teachers go above and beyond to ensure we understand every concept.' }
  ];
  return (
    <section className="section section--dark" ref={ref}>
      <div className={`reveal ${visible ? 'reveal--in' : ''}`}>
        <div className="section__head">
          <div className="section__label section__label--light">Student Voices</div>
          <h2 className="section__title section__title--light">WHAT THEY<br />SAY.</h2>
        </div>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="testi-card__mark">"</div>
              <p className="testi-card__text">{t.feedback}</p>
              <div className="testi-card__author">
                <div className="testi-card__avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="testi-card__name">{t.name}</div>
                  <div className="testi-card__meta">{t.standard} · {t.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PUDUCHERRY_SCHOOLS = [
  'Achariya Bala Siksha Mandir - Anna Nagar',
  'Achariya Bala Siksha Mandir - Gorimedu',
  'Achariya Bala Siksha Mandir - Lawspet',
  'Achariya Bala Siksha Mandir - Salai',
  'Achariya Bala Siksha Mandir - Thengaithittu',
  'Achariya Siksha Mandir - Adhikesavan Nagar',
  'Achariya Siksha Mandir - Muthu Nagar',
  'Achariya Siksha Mandir - Nallavadu Road',
  'Achariya Siksha Mandir - Reddiyarpalayam',
  'Achariya Siksha Mandir - Villianur',
  'Adarsh Concept School - Karaikal',
  'Aditya Bidyashram',
  'Aditya Vidyashram Residential School',
  'AJ Higher Secondary School',
  'Aklavya Achariya World School',
  'Aklavya International School, Thengaithittu',
  'Alpha English Higher Secondary School',
  'Alpha English School',
  'Alpha International School',
  'Alpha Matriculation Higher Secondary School',
  'Amala Higher Secondary School',
  'Amalorpavam Higher Secondary School',
  'Amalorpavam Lourds Academy',
  'Amrita Vidyalayam, Pondicherry',
  'Arul Sasthalaya Higher Secondary School',
  'Avinshree International School',
  'Balaji Siksha Mandir',
  'Bhavani Vidyashram',
  'Billabong High International School, Moolakulam',
  'Brainy Blooms Lecole Internationale',
  'Bright Academy - Karaikal',
  'Cauvery Public School - Karaikal',
  'Chevalier Sellane Govt. Hr. Sec. School, Kalapet',
  'Christ International School',
  'Dr. Ambedkar Govt. Hr. Sec. School, Kirumampakkam',
  'Good Shepherd English School - Karaikal',
  'Govt. Hr. Sec. School, Korkadu',
  'Government Higher Secondary School, Oulgaret',
  'Holy Flowers Higher Secondary School',
  'Ilangoadigal Govt. Hr. Sec. School, Muthirapalayam',
  'Immaculate Heart of Mary\'s High School, Reddiarpalayam',
  'Jawahar Navodaya Vidyalaya, Kalapet',
  'Kendriya Vidyalaya No 1, JIPMER Campus',
  'Kendriya Vidyalaya No 2, PU Campus, Kalapet',
  'Maharishi Vidya Mandir',
  'Mahalashmi School - Karaikal',
  'Maraimalai Adigal Govt. Hr. Sec. School, Embalam',
  'Maruthi Matriculation Higher Secondary School',
  'ONGC Public School - Karaikal',
  'Petit Seminaire School',
  'Primrose School, Marie Oulgaret',
  'Sairam Vidyalaya',
  'Shree Bharath Vidyaashram',
  'Sri Annai Raani Convent Hr. Sec. School',
  'St. Joseph High School, Oulgaret',
  'St. Joseph Of Cluny School',
  'Stansford International Hr. Sec. School',
  'The Study',
  'Universal Academy High School',
  'Vaasavi International School',
  'V.O.C Government Higher Secondary School',
  'Vivekanandha School',
  'Sri Sankara Vidyalaya - ECR',
  'Sri Sankara Vidyalaya - MG Road', 
  'Vivekanandha Vidyalaya',
];

function RegistrationForm() {
  const [ref, visible] = useScrollReveal();
  const [formData, setFormData] = useState({
    studentName: '', std: '', gender: '', dob: '', board: '', school: '',
    subjectMaths: false, subjectScience: false, subjectPhysics: false, subjectChemistry: false,
    fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
    address: '', cellNo: '', cellNo2: '', whatsappNo: '', email: '', photo: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/academic-year')
      .then(r => r.json())
      .then(d => { if (d.success && d.academicYear) setAcademicYear(d.academicYear); })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'std') {
      setFormData(prev => ({ ...prev, [name]: value, subjectMaths: false, subjectScience: false, subjectPhysics: false, subjectChemistry: false }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSchoolInput = (e) => {
    const val = e.target.value;
    setErrors(prev => ({ ...prev, school: '' }));
    setFormData(prev => ({ ...prev, school: val }));
    if (val.length >= 1) {
      const filtered = PUDUCHERRY_SCHOOLS.filter(s => s.toLowerCase().includes(val.toLowerCase()));
      setSchoolSuggestions(filtered.slice(0, 8));
      setShowSchoolDropdown(true);
    } else {
      setShowSchoolDropdown(false);
    }
  };

  const handleSchoolSelect = (school) => {
    setFormData(prev => ({ ...prev, school }));
    setShowSchoolDropdown(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.studentName.trim()) e.studentName = 'Required';
    if (!formData.std) e.std = 'Required';
    if (!formData.gender) e.gender = 'Required';
    if (!formData.dob) { e.dob = 'Required'; }
    else if (formData.std) {
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (formData.std === '10th' && age < 13) e.dob = 'Must be at least 13';
      if (formData.std === '11th' && age < 14) e.dob = 'Must be at least 14';
      if (formData.std === '12th' && age < 15) e.dob = 'Must be at least 15';
    }
    if (!formData.board) e.board = 'Required';
    if (!formData.school.trim()) e.school = 'Required';
    if (!formData.fatherName.trim()) e.fatherName = 'Required';
    if (!formData.motherName.trim()) e.motherName = 'Required';
    if (!formData.address.trim()) e.address = 'Required';
    if (!formData.cellNo.trim()) e.cellNo = 'Required';
    else if (!/^\d{10}$/.test(formData.cellNo)) e.cellNo = 'Must be 10 digits';
    if (formData.cellNo2 && !/^\d{10}$/.test(formData.cellNo2)) e.cellNo2 = 'Must be 10 digits';
    if (formData.whatsappNo && !/^\d{10}$/.test(formData.whatsappNo)) e.whatsappNo = 'Must be 10 digits';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.subjectMaths && !formData.subjectScience && !formData.subjectPhysics && !formData.subjectChemistry) e.subjects = 'Select at least one';
    if (!formData.photo) e.photo = 'Photo required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generatePDF = (formData, academicYear) => {
    const doc = new jsPDF();
    doc.setFontSize(13); doc.setFont('times', 'italic');
    doc.text('Application No :', 135, 8);
    doc.setLineWidth(0.5); doc.rect(10, 12, 190, 275);
    doc.setFont('times', 'bold'); doc.setFontSize(24);
    doc.text('SUCCESS ACADEMY', 105, 24, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${formData.std.toUpperCase()} STD APPLICATION FORM`, 105, 35, { align: 'center' });
    const [sy, ey] = academicYear.split('-');
    doc.text(`FOR THE YEAR ${sy} - ${sy.substring(0,2)+ey}`, 105, 45, { align: 'center' });
    doc.text(`(${formData.board.toUpperCase()})`, 105, 55, { align: 'center' });
    doc.setFont('times', 'normal'); doc.setFontSize(12);
    doc.text('No: 18A, 6TH CROSS STREET, KUMARAN NAGAR, LAWSPET, PUDUCHERRY - 605008.', 105, 64, { align: 'center' });
    doc.text('CELL : 8428439904, 8668068109 & 9443638914', 105, 72, { align: 'center' });
    doc.setLineWidth(0.3); doc.rect(158, 80, 37, 42);
    if (formData.photo) { doc.addImage(formData.photo, 'JPEG', 158, 80, 37, 42); }
    else { doc.setFontSize(10); doc.setFont('times','italic'); doc.text('Affix photo', 176.5, 101, { align: 'center' }); }
    doc.setFont('times', 'normal'); doc.setFontSize(13);
    let y = 90; const lx = 15, cx = 72, vx = 76;
    const row = (label, value) => { doc.text(label, lx, y); doc.text(':', cx, y); doc.text((value||'').toUpperCase(), vx, y); y += 11; };
    row('Name of the Student', formData.studentName);
    row('Gender', formData.gender);
    row('Date of Birth', formData.dob);
    row('Name of the School', formData.school);
    doc.text('Subject(s) opted', lx, y); doc.text(':', cx, y);
    let sx = vx;
    doc.text('MATHS', sx, y); doc.rect(sx+18, y-3.5, 5, 5);
    if (formData.subjectMaths) { doc.setLineWidth(0.7); doc.line(sx+19.2,y-0.8,sx+20.5,y+0.3); doc.line(sx+20.5,y+0.3,sx+22.3,y-2.8); doc.setLineWidth(0.3); }
    sx += 42;
    if (formData.std === '10th') {
      doc.text('SCIENCE', sx, y); doc.rect(sx+21, y-3.5, 5, 5);
      if (formData.subjectScience) { doc.setLineWidth(0.7); doc.line(sx+22.2,y-0.8,sx+23.5,y+0.3); doc.line(sx+23.5,y+0.3,sx+25.3,y-2.8); doc.setLineWidth(0.3); }
    } else {
      doc.text('PHYSICS', sx, y); doc.rect(sx+22, y-3.5, 5, 5);
      if (formData.subjectPhysics) { doc.setLineWidth(0.7); doc.line(sx+23.2,y-0.8,sx+24.5,y+0.3); doc.line(sx+24.5,y+0.3,sx+26.3,y-2.8); doc.setLineWidth(0.3); }
      sx += 44;
      doc.text('CHEMISTRY', sx, y); doc.rect(sx+28, y-3.5, 5, 5);
      if (formData.subjectChemistry) { doc.setLineWidth(0.7); doc.line(sx+29.2,y-0.8,sx+30.5,y+0.3); doc.line(sx+30.5,y+0.3,sx+32.3,y-2.8); doc.setLineWidth(0.3); }
    }
    y += 13;
    row("Father's Name", formData.fatherName);
    row("Father's Occupation", formData.fatherOccupation);
    row("Mother's Name", formData.motherName);
    row("Mother's Occupation", formData.motherOccupation);
    doc.text('Residential Address', lx, y); doc.text(':', cx, y);
    const addrLines = doc.splitTextToSize(formData.address.toUpperCase(), 115);
    doc.text(addrLines, vx, y); y += addrLines.length * 7 + 11;
    row('Cell No(s)', formData.cellNo2 ? `${formData.cellNo}, ${formData.cellNo2}` : formData.cellNo);
    row('WhatsApp No.', formData.whatsappNo);
    row('e - mail id', formData.email);
    y += 17;
    doc.setFont('times', 'normal'); doc.setFontSize(13);
    doc.text('Signature of the Student', 28, 275);
    doc.text('Signature of the Parent', 138, 275);
    return { pdfBlob: doc.output('blob'), pdfBase64: doc.output('datauristring').split(',')[1] };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { alert('Please fill all required fields correctly'); return; }
    setIsSubmitting(true);
    try {
      const { pdfBlob, pdfBase64 } = generatePDF(formData, academicYear);
      const response = await fetch('http://localhost:5000/api/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, pdfBase64 })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');
      if (result.success) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url; a.download = `Success_Academy_Application_${formData.studentName.replace(/\s+/g,'_')}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert('Application submitted successfully! Your form is downloading.');
        setFormData({ studentName:'',std:'',gender:'',dob:'',board:'',school:'',subjectMaths:false,subjectScience:false,subjectPhysics:false,subjectChemistry:false,fatherName:'',fatherOccupation:'',motherName:'',motherOccupation:'',address:'',cellNo:'',cellNo2:'',whatsappNo:'',email:'',photo:null });
      }
    } catch(err) { alert(`Submission failed: ${err.message}`); }
    finally { setIsSubmitting(false); }
  };

  const SubjectOptions = () => {
    if (!formData.std) return null;
    const opts = formData.std === '10th'
      ? [['subjectMaths','Maths'],['subjectScience','Science']]
      : [['subjectMaths','Maths'],['subjectPhysics','Physics'],['subjectChemistry','Chemistry']];
    return opts.map(([name, label]) => (
      <label key={name} className="chk">
        <input type="checkbox" name={name} checked={formData[name]} onChange={handleInputChange} />
        <span className="chk__box"></span>
        <span className="chk__label">{label}</span>
      </label>
    ));
  };

  const [startYear] = academicYear.split('-');
  const endYear = academicYear.split('-')[1];
  const displayYear = `${startYear} - ${startYear.substring(0,2)+endYear}`;

  return (
    <section id="registration" className="section section--form" ref={ref}>
      <div className={`reveal ${visible ? 'reveal--in' : ''}`}>
        <div className="section__head">
          <div className="section__label">Join Us</div>
          <h2 className="section__title">STUDENT<br />REGISTRATION.</h2>
          <p className="form__year">Academic Year {displayYear}</p>
        </div>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="form__section">
            <div className="form__section-title">Student Information</div>
            <div className="form__grid">
              <div className="form__field">
                <label className="form__label">Name of the Student *</label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="Full name" className={`form__input ${errors.studentName ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.studentName && <span className="form__err">{errors.studentName}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Standard *</label>
                <select name="std" value={formData.std} onChange={handleInputChange} className={`form__input form__input--select ${errors.std ? 'form__input--err' : ''}`} disabled={isSubmitting}>
                  <option value="">Select</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
                {errors.std && <span className="form__err">{errors.std}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={`form__input form__input--select ${errors.gender ? 'form__input--err' : ''}`} disabled={isSubmitting}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="form__err">{errors.gender}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`form__input ${errors.dob ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.dob && <span className="form__err">{errors.dob}</span>}
              </div>
            </div>
            <div className="form__field">
              <label className="form__label">Board *</label>
              <div className="radio-group">
                {['CBSE','State Board','ICSE'].map(b => (
                  <label key={b} className="radio">
                    <input type="radio" name="board" value={b} checked={formData.board===b} onChange={handleInputChange} disabled={isSubmitting} />
                    <span className="radio__dot"></span>
                    <span>{b}</span>
                  </label>
                ))}
              </div>
              {errors.board && <span className="form__err">{errors.board}</span>}
            </div>
            <div className="form__field">
              <label className="form__label">School Name *</label>
              <div className="school-search-wrapper">
                <input type="text" name="school" value={formData.school} onChange={handleSchoolInput} onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 150)} placeholder="Search school name..." className={`form__input ${errors.school ? 'form__input--err' : ''}`} disabled={isSubmitting} autoComplete="off" />
                {showSchoolDropdown && schoolSuggestions.length > 0 && (
                  <div className="school-dropdown">
                    {schoolSuggestions.map((s, i) => (
                      <div key={i} className="school-dropdown__item" onMouseDown={() => handleSchoolSelect(s)}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
              {errors.school && <span className="form__err">{errors.school}</span>}
            </div>
            {formData.std && (
              <div className="form__field">
                <label className="form__label">Subject(s) opted *</label>
                <div className="chk-group"><SubjectOptions /></div>
                {errors.subjects && <span className="form__err">{errors.subjects}</span>}
              </div>
            )}
          </div>
          <div className="form__section">
            <div className="form__section-title">Parental &amp; Contact Details</div>
            <div className="form__grid">
              <div className="form__field">
                <label className="form__label">Father's Name *</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's full name" className={`form__input ${errors.fatherName ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.fatherName && <span className="form__err">{errors.fatherName}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Father's Occupation</label>
                <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="Occupation" className="form__input" disabled={isSubmitting} />
              </div>
              <div className="form__field">
                <label className="form__label">Mother's Name *</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's full name" className={`form__input ${errors.motherName ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.motherName && <span className="form__err">{errors.motherName}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Mother's Occupation</label>
                <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="Occupation" className="form__input" disabled={isSubmitting} />
              </div>
            </div>
            <div className="form__field">
              <label className="form__label">Residential Address *</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Complete address" rows="3" className={`form__input form__textarea ${errors.address ? 'form__input--err' : ''}`} disabled={isSubmitting}></textarea>
              {errors.address && <span className="form__err">{errors.address}</span>}
            </div>
            <div className="form__grid form__grid--3">
              <div className="form__field">
                <label className="form__label">Cell No. 1 *</label>
                <input type="tel" name="cellNo" value={formData.cellNo} onChange={handleInputChange} placeholder="10 digits" maxLength="10" className={`form__input ${errors.cellNo ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.cellNo && <span className="form__err">{errors.cellNo}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">Cell No. 2</label>
                <input type="tel" name="cellNo2" value={formData.cellNo2} onChange={handleInputChange} placeholder="10 digits" maxLength="10" className={`form__input ${errors.cellNo2 ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.cellNo2 && <span className="form__err">{errors.cellNo2}</span>}
              </div>
              <div className="form__field">
                <label className="form__label">WhatsApp No.</label>
                <input type="tel" name="whatsappNo" value={formData.whatsappNo} onChange={handleInputChange} placeholder="10 digits" maxLength="10" className={`form__input ${errors.whatsappNo ? 'form__input--err' : ''}`} disabled={isSubmitting} />
                {errors.whatsappNo && <span className="form__err">{errors.whatsappNo}</span>}
              </div>
            </div>
            <div className="form__field">
              <label className="form__label">Email ID *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className={`form__input ${errors.email ? 'form__input--err' : ''}`} disabled={isSubmitting} />
              {errors.email && <span className="form__err">{errors.email}</span>}
            </div>
            <div className="form__field">
              <label className="form__label">Student Photo *</label>
              <div className="photo-upload">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} id="photo-upload" className="photo-upload__input" disabled={isSubmitting} />
                <label htmlFor="photo-upload" className="photo-upload__area">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>{formData.photo ? 'Change Photo' : 'Upload passport size photo'}</span>
                </label>
                {formData.photo && <div className="photo-upload__preview"><img src={formData.photo} alt="Preview" /></div>}
              </div>
              {errors.photo && <span className="form__err">{errors.photo}</span>}
            </div>
          </div>
          <button type="submit" className="form__submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="form__spinner"></span><span>Submitting...</span></>
            ) : (
              <><span>Submit Application</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9H15M15 9L9 3M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg></>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">SUCCESS ACADEMY</div>
        <div className="footer__info">
          <p>18A, 6th Cross Street, Kumaran Nagar, Lawspet, Puducherry – 605008</p>
          <p>8428439904 · 8668068109 · 9443638914</p>
        </div>
        <div className="footer__copy">© 2026 Success Academy. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <HeroSection />
      <AchievementsSection />
      <TestimonialsSection />
      <RegistrationForm />
      <Footer />
    </div>
  );
}