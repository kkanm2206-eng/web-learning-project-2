import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface border border-stroke rounded-3xl shadow-2xl p-6 sm:p-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-stroke/40 hover:bg-stroke text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Header */}
            <div className="border-b border-stroke/50 pb-6 mb-8 pr-10">
              <span className="text-xs text-[#89AACC] uppercase tracking-[0.3em] font-mono block mb-2">
                Self-Introduction · คำแนะนำเกี่ยวกับเว็บไซต์
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-text-primary tracking-tight">
                Miss Phimchanok Suksanguan &amp; Mr. Kunanon Mokhom
              </h2>
              <p className="text-sm text-muted mt-1.5 font-mono">
                Project on the Development of an Educational Website for an Introductory Web Design Course
              </p>
            </div>

            {/* Content Sections: Website Introduction & Guide */}
            <div className="space-y-8 text-sm font-['Prompt',sans-serif]">
              {/* Overview */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted font-mono mb-3">
                  เกี่ยวกับเว็บไซต์สื่อการสอนนี้ (About This Website)
                </h3>
                <p className="text-sm text-text-primary/90 leading-relaxed">
                  เว็บไซต์นี้จัดทำขึ้นเพื่อเป็นสื่อการเรียนการสอนออนไลน์ เรื่อง{' '}
                  <span className="text-white font-medium">การสร้างเว็บไซต์เบื้องต้น</span>{' '}
                  สำหรับผู้ที่เริ่มต้นสนใจศึกษาการออกแบบและพัฒนาเว็บไซต์ โดยรวบรวมองค์ความรู้ตั้งแต่พื้นฐานการทำงานของเว็บไซต์ การเขียนโครงสร้างด้วยภาษา HTML การตกแต่งหน้าเว็บด้วย CSS ไปจนถึงการเพิ่มการโต้ตอบด้วย JavaScript และการลงมือพัฒนาโครงงานจริง
                </p>
              </div>

              {/* Usage Guide */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted font-mono mb-4">
                  คำแนะนำการใช้งานเว็บไซต์ (Website Guide)
                </h3>
                <div className="space-y-4">
                  <div className="border-l border-stroke pl-4">
                    <h4 className="font-medium text-text-primary mb-1">
                      1. ศึกษาบทเรียนทั้ง 10 บท (Educational Content)
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      เลื่อนลงไปยังส่วน Basic Website Development และคลิกที่การ์ดบทเรียนที่ต้องการเพื่อเปิดอ่านเนื้อหาอย่างละเอียด พร้อมตัวอย่างโค้ดที่สามารถกดคัดลอกได้ ตารางเปรียบเทียบ สรุปเนื้อหาสำคัญ และกิจกรรมฝึกปฏิบัติ
                    </p>
                  </div>

                  <div className="border-l border-stroke pl-4">
                    <h4 className="font-medium text-text-primary mb-1">
                      2. แกลเลอรีภาพประกอบความรู้ (Visual Explorations)
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      สามารถเลื่อนชมภาพประกอบแนวคิดการพัฒนาเว็บในส่วนท้ายของหน้าแรก และคลิกที่ภาพเพื่อขยายดูรายละเอียดเพิ่มเติมได้
                    </p>
                  </div>

                  <div className="border-l border-stroke pl-4">
                    <h4 className="font-medium text-text-primary mb-1">
                      3. เครื่องเล่นเพลงพื้นหลัง (Ambient Music Player)
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      มุมล่างซ้ายมีเครื่องเล่นเพลงที่ช่วยสร้างบรรยากาศในการอ่านบทเรียน สามารถกดเล่น/หยุด ปรับระดับเสียง หรือเปิดหน้าต่างวิดีโอประกอบได้ตลอดเวลา
                    </p>
                  </div>
                </div>
              </div>

              {/* Creators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stroke/40">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted font-mono mb-2">
                    ผู้จัดทำโครงงาน (Creators)
                  </h3>
                  <ul className="space-y-1 text-xs text-text-primary/90 leading-relaxed">
                    <li>• Miss Phimchanok Suksanguan</li>
                    <li>• Mr. Kunanon Mokhom</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted font-mono mb-2">
                    วัตถุประสงค์หลัก (Objectives)
                  </h3>
                  <p className="text-xs text-text-primary/80 leading-relaxed">
                    มุ่งเน้นให้ผู้เรียนเข้าใจหลักการสร้างเว็บไซต์อย่างเป็นระบบ สามารถเรียนรู้ได้ด้วยตนเองและนำไปประยุกต์ใช้สร้างผลงานจริงได้อย่างมีประสิทธิภาพ
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-stroke/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted font-mono">
                จัดทำโดย Miss Phimchanok Suksanguan &amp; Mr. Kunanon Mokhom
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

