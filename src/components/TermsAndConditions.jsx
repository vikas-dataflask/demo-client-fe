import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';
import { clearAuthData } from '../utils/authUtils';

const TermsAndConditions = () => {
  const [accepted, setAccepted] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleAccept = () => {
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      // Navigate to dashboard or main app
      navigate('/dashboard');
    }
  };

  const handleDecline = () => {
    // Clear any stored auth data and redirect to login
    clearAuthData();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
            DesignDrafter
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-2">Terms of Service & Privacy Policy</p>
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">Last Updated: {currentDate}</span>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-lg border border-white/20">
          <button
            onClick={() => setShowPrivacyPolicy(false)}
            className={`flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
              !showPrivacyPolicy
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms of Service
            </div>
          </button>
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className={`flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
              showPrivacyPolicy
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Policy
            </div>
          </button>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 overflow-hidden custom-scrollbar max-h-96 overflow-y-auto">
          <div className="prose prose-lg max-w-none">
                         {!showPrivacyPolicy ? (
               // Terms of Service Content
               <div className="animate-fadeIn">
                 <div className="flex items-center mb-8">
                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                   </div>
                   <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Terms of Service</h2>
                 </div>
                 
                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
                   <p className="text-gray-700 text-lg leading-relaxed mb-4">
                     Welcome to <span className="font-semibold text-blue-600">DesignDrafter</span> ("Company", "we", "our", or "us"). These Terms of Service ("Terms", "Agreement") govern your access to and use of our software-as-a-service platform ("Platform" or "Service") available at www.designdrafter.com and related applications.
                   </p>

                   <p className="text-gray-700 text-lg leading-relaxed">
                     By clicking "I Agree" or by registering an account, you ("User", "you", or "your") agree to be legally bound by these Terms. If you do not agree with these Terms, you must not use the Service.
                   </p>
                 </div>

                                  <div className="space-y-8">
                   <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover-lift">
                     <div className="flex items-center mb-4">
                       <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                         <span className="text-white font-bold text-sm">1</span>
                       </div>
                       <h3 className="text-xl font-bold text-gray-900">Eligibility</h3>
                     </div>
                     <p className="text-gray-700 mb-3 font-medium">To use DesignDrafter's services, you must:</p>
                     <ul className="space-y-2">
                       <li className="flex items-start">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                         <span className="text-gray-700">Be at least 18 years old and legally competent.</span>
                       </li>
                       <li className="flex items-start">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                         <span className="text-gray-700">Provide accurate and current registration details.</span>
                       </li>
                       <li className="flex items-start">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                         <span className="text-gray-700">Not be prohibited from using our services under applicable laws.</span>
                       </li>
                     </ul>
                   </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Account Registration & Security</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>You are responsible for all activities under your account.</li>
                      <li>You must maintain the confidentiality of your login credentials.</li>
                      <li>Notify us immediately of any unauthorized use of your account.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Use of Services</h3>
                    <p className="text-gray-700 mb-2">You agree to use the platform only for lawful, professional purposes. You must not:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Violate any applicable local, national, or international law.</li>
                      <li>Upload malicious software or misuse platform features.</li>
                      <li>Attempt to reverse engineer, decompile, or access the source code.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription & Payments</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Certain features require a paid subscription.</li>
                      <li>All prices are subject to change with prior notice.</li>
                      <li>Payments are non-refundable except as required by law.</li>
                      <li>You authorize us to charge your preferred payment method on a recurring basis.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Intellectual Property</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>All content, trademarks, and software on the platform are owned by DesignDrafter or its licensors.</li>
                      <li>You retain ownership of content or data you upload but grant us a license to use, host, and process it for providing the Service.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Data Privacy</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Your data will be handled in compliance with Indian data protection laws.</li>
                      <li>Please review our Privacy Policy for more details.</li>
                      <li>We implement commercially reasonable security measures but cannot guarantee complete protection against data breaches.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Termination</h3>
                    <p className="text-gray-700 mb-2">We reserve the right to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Suspend or terminate your account if you breach these Terms.</li>
                      <li>Remove content that violates our policies or applicable laws.</li>
                    </ul>
                    <p className="text-gray-700 mt-2">You may close your account anytime by contacting support.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
                    <p className="text-gray-700 mb-2">To the fullest extent permitted by law:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>DesignDrafter shall not be liable for any indirect, incidental, or consequential damages.</li>
                      <li>We are not liable for any loss of data, business interruption, or financial damages due to use or inability to use the Service.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimer</h3>
                    <p className="text-gray-700 mb-2">The Service is provided "as is" without warranties of any kind. We do not warrant that:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>The platform will be error-free or uninterrupted.</li>
                      <li>All data or results will be accurate or suitable for your specific use case.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Modifications to Terms</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>We may update these Terms periodically.</li>
                      <li>Users will be notified of significant changes via email or platform notifications.</li>
                      <li>Continued use of the service post-change implies acceptance of the updated Terms.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law & Jurisdiction</h3>
                    <p className="text-gray-700">These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Gautam Budh Nagar, Uttar Pradesh.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h3>
                    <p className="text-gray-700 mb-2">If you have questions regarding these Terms, please contact us at:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 font-medium">DesignDrafter</p>
                      <p className="text-gray-700">Office No-8106, Gaur City Mall,</p>
                      <p className="text-gray-700">Sec-4, Greater Noida West,</p>
                      <p className="text-gray-700">Uttar Pradesh, India – 201318</p>
                      <p className="text-gray-700">Email: support@designdrafter.com</p>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              // Privacy Policy Content
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                
                <p className="text-gray-700 mb-6">
                  DesignDrafter ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, store, and disclose your personal information when you access or use our SaaS-based web application ("Platform") available at www.designdrafter.com.
                </p>

                <p className="text-gray-700 mb-8">
                  By using our Service, you agree to the terms of this Privacy Policy.
                </p>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                    <p className="text-gray-700 mb-3">We collect the following types of information:</p>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">a. Personal Information</h4>
                    <p className="text-gray-700 mb-2">When you register or interact with our platform, we may collect:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Company name</li>
                      <li>Billing information (for paid subscriptions)</li>
                    </ul>

                    <h4 className="text-lg font-medium text-gray-900 mb-2">b. Technical Information</h4>
                    <p className="text-gray-700 mb-2">Automatically collected through cookies, logs, or third-party tools:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
                      <li>IP address</li>
                      <li>Browser type and version</li>
                      <li>Device information</li>
                      <li>Log data, including pages visited and actions taken</li>
                    </ul>

                    <h4 className="text-lg font-medium text-gray-900 mb-2">c. Project/Usage Data</h4>
                    <p className="text-gray-700 mb-2">When using the platform, we may store:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Uploaded files (e.g., drawings, models)</li>
                      <li>Design parameters and user-generated data</li>
                      <li>Configuration settings and preferences</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                    <p className="text-gray-700 mb-2">We use your data to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Create and manage user accounts</li>
                      <li>Provide, operate, and improve the platform</li>
                      <li>Process payments and subscriptions</li>
                      <li>Communicate updates and service-related notices</li>
                      <li>Respond to user support and inquiries</li>
                      <li>Analyze user activity to improve UX and performance</li>
                      <li>Comply with legal or regulatory obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies and Tracking</h3>
                    <p className="text-gray-700 mb-2">We use cookies and similar technologies to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
                      <li>Maintain session integrity</li>
                      <li>Analyze traffic and platform usage</li>
                      <li>Personalize user experience</li>
                    </ul>
                    <p className="text-gray-700">You can manage or block cookies via your browser settings, but some features may not function properly without them.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing & Disclosure</h3>
                    <p className="text-gray-700 mb-2">We do not sell or rent your personal information. We may share your data with:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Trusted third-party service providers, such as payment processors and cloud storage vendors (under confidentiality agreements)</li>
                      <li>Legal or regulatory authorities if required by applicable law, subpoena, or court order</li>
                      <li>Corporate affiliates or successors, in case of a merger, acquisition, or asset transfer</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage and Security</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Data is stored securely using industry-standard encryption and access controls.</li>
                      <li>We use secure servers and cloud infrastructure within India or compliant international regions.</li>
                      <li>However, no system is completely secure. We cannot guarantee absolute protection from cyber threats.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h3>
                    <p className="text-gray-700 mb-2">You have the right to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Access, update, or delete your personal information</li>
                      <li>Withdraw consent at any time (may affect functionality)</li>
                      <li>Request export of your data in a readable format</li>
                      <li>Lodge a complaint with the Data Protection Board (under DPDP Act, India) if you believe your data rights are violated</li>
                    </ul>
                    <p className="text-gray-700 mt-2">You can manage most of your data via account settings or contact us directly.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h3>
                    <p className="text-gray-700 mb-2">We retain personal and project-related data:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>As long as your account remains active</li>
                      <li>For legal, tax, audit, or regulatory compliance</li>
                      <li>For internal analysis and backup, for a limited period after account closure</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h3>
                    <p className="text-gray-700">Our platform is intended for users above 18 years of age. We do not knowingly collect data from children under 18. If we become aware of such data, we will delete it immediately.</p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>We may update this Privacy Policy from time to time.</li>
                      <li>Any significant changes will be notified via email or platform alerts.</li>
                      <li>Continued use of the platform constitutes acceptance of the updated policy.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h3>
                    <p className="text-gray-700 mb-2">If you have questions, concerns, or requests regarding this Privacy Policy, please contact:</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 font-medium">DesignDrafter</p>
                      <p className="text-gray-700">Office No-8106, Gaur City Mall,</p>
                      <p className="text-gray-700">Sec-4, Greater Noida West,</p>
                      <p className="text-gray-700">Uttar Pradesh, India – 201318</p>
                      <p className="text-gray-700">Email: support@designdrafter.com</p>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Disclaimer */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Legal Disclaimer</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                © {new Date().getFullYear()} DesignDrafter. All rights reserved. Use of this platform is subject to our Terms of Service and Privacy Policy. DesignDrafter does not guarantee the completeness or accuracy of any design output and shall not be held liable for any direct or indirect damages resulting from its use. All trademarks and logos are the property of their respective owners.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Checkbox Section */}
          <div className="flex items-start mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="accept-terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded-lg transition-all duration-200"
              />
            </div>
            <label htmlFor="accept-terms" className="ml-4 text-base text-gray-700 font-medium leading-relaxed">
              I have read, understood, and agree to the <span className="text-green-600 font-semibold">Terms of Service</span> and <span className="text-green-600 font-semibold">Privacy Policy</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform ripple ${
                accepted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {accepted && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
              <span className="relative flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept & Continue
              </span>
            </button>
            <button
              onClick={handleDecline}
              className="group px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 ripple"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 
