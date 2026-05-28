import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { Save, User as UserIcon, FileText, Edit2, Mail, Phone, Building, Briefcase, GraduationCap, Link as LinkIcon, X } from 'lucide-react';
import '../styles/auth.css'; // Reuse auth styles for the container

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    alternateEmail: user.alternateEmail || '',
    mobile: user.mobile || '',
    collegeName: user.collegeName || '',
    collegeAddress: user.collegeAddress || '',
    collegeWebsite: user.collegeWebsite || '',
    departmentName: user.departmentName || '',
    departmentWebpage: user.departmentWebpage || '',
    programme: user.programme || '',
    branch: user.branch || '',
    gpa: user.gpa || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      alternateEmail: user.alternateEmail || '',
      mobile: user.mobile || '',
      collegeName: user.collegeName || '',
      collegeAddress: user.collegeAddress || '',
      collegeWebsite: user.collegeWebsite || '',
      departmentName: user.departmentName || '',
      departmentWebpage: user.departmentWebpage || '',
      programme: user.programme || '',
      branch: user.branch || '',
      gpa: user.gpa || '',
    });
    setIsEditing(false);
  };

  const DetailItem = ({ icon: Icon, label, value, href }: { icon: any, label: string, value: string, href?: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(240, 192, 64, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        {href && value ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontSize: '15px', fontWeight: 500 }}>{value}</a>
        ) : (
          <div style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '15px', fontWeight: value ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value || 'Not provided'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 24px', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Profile Header Card */}
        <div style={{ position: 'relative', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', marginBottom: '24px' }}>
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, rgba(240,192,64,0.15) 0%, transparent 100%)', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', boxShadow: '0 8px 24px rgba(240,192,64,0.15)' }}>
                <UserIcon size={48} />
              </div>
              <div>
                <h1 style={{ fontSize: '32px', margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 700 }}>{user.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} /> {user.email}
                  </span>
                  <span style={{ display: 'inline-block', fontSize: '11px', padding: '4px 10px', background: user.role === 'admin' ? 'rgba(240,192,64,0.1)' : 'rgba(255,255,255,0.05)', color: user.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '100px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {isSaved && (
          <div style={{ padding: '16px 24px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeInUp 0.3s ease' }}>
            <Save size={18} /> Profile updated successfully!
          </div>
        )}

        {/* Content Area */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '40px', border: '1px solid var(--border)' }}>
          {isEditing ? (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Personal Information</h3>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="alternateEmail">Alternate Email Address</label>
                <input className="form-input" id="alternateEmail" name="alternateEmail" type="email" value={formData.alternateEmail} onChange={handleChange} placeholder="alt@example.com" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mobile">Mobile Phone Number</label>
                <input className="form-input" id="mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>College Details</h3>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="collegeName">Name of the College</label>
                <input className="form-input" id="collegeName" name="collegeName" type="text" value={formData.collegeName} onChange={handleChange} placeholder="e.g. Indian Institute of Technology" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="collegeAddress">Full Address of the College</label>
                <input className="form-input" id="collegeAddress" name="collegeAddress" type="text" value={formData.collegeAddress} onChange={handleChange} placeholder="Street, City, State, ZIP" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="collegeWebsite">College Website</label>
                <input className="form-input" id="collegeWebsite" name="collegeWebsite" type="url" value={formData.collegeWebsite} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="departmentName">Department Name</label>
                <input className="form-input" id="departmentName" name="departmentName" type="text" value={formData.departmentName} onChange={handleChange} placeholder="e.g. Computer Science" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="departmentWebpage">Department Webpage</label>
                <input className="form-input" id="departmentWebpage" name="departmentWebpage" type="url" value={formData.departmentWebpage} onChange={handleChange} placeholder="https://..." />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Programme Details</h3>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="programme">Programme registered for</label>
                <input className="form-input" id="programme" name="programme" type="text" placeholder="B.Tech, M.Tech, etc." value={formData.programme} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="branch">Branch</label>
                <input className="form-input" id="branch" name="branch" type="text" value={formData.branch} onChange={handleChange} placeholder="CS/Data Science/Math etc" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="gpa">GPA / Percentage across all semesters</label>
                <input className="form-input" id="gpa" name="gpa" type="text" value={formData.gpa} onChange={handleChange} placeholder="e.g. 8.5 CGPA" />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" onClick={handleCancel} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <X size={18} /> Cancel
                </button>
                <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>

            </form>
          ) : (
            <div style={{ display: 'grid', gap: '40px' }}>
              
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserIcon size={20} color="var(--accent)" /> Personal Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <DetailItem icon={Mail} label="Alternate Email" value={user.alternateEmail || ''} href={user.alternateEmail ? `mailto:${user.alternateEmail}` : undefined} />
                  <DetailItem icon={Phone} label="Mobile Number" value={user.mobile || ''} href={user.mobile ? `tel:${user.mobile}` : undefined} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={20} color="var(--accent)" /> College & Department
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><DetailItem icon={Building} label="College Name" value={user.collegeName || ''} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><DetailItem icon={Building} label="College Address" value={user.collegeAddress || ''} /></div>
                  <DetailItem icon={LinkIcon} label="College Website" value={user.collegeWebsite || ''} href={user.collegeWebsite} />
                  <DetailItem icon={Briefcase} label="Department Name" value={user.departmentName || ''} />
                  <div style={{ gridColumn: '1 / -1' }}><DetailItem icon={LinkIcon} label="Department Webpage" value={user.departmentWebpage || ''} href={user.departmentWebpage} /></div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} color="var(--accent)" /> Academic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <DetailItem icon={GraduationCap} label="Programme" value={user.programme || ''} />
                  <DetailItem icon={Briefcase} label="Branch" value={user.branch || ''} />
                  <DetailItem icon={FileText} label="GPA / Percentage" value={user.gpa || ''} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--accent)" /> Documents
                </h3>
                {user.cvFileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'rgba(240, 192, 64, 0.05)', border: '1px solid rgba(240, 192, 64, 0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>{user.cvFileName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Uploaded during registration</div>
                    </div>
                    <button type="button" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(240, 192, 64, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      View Document
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={32} style={{ opacity: 0.5, margin: '0 auto 12px' }} />
                    <p style={{ margin: 0 }}>No CV was uploaded during registration.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
