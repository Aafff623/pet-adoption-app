import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Section {
  title: string;
  content: string;
}

const sections: Section[] = [
  {
    title: '一、总则',
    content: '欢迎使用 PetConnect 平台。本协议是用户（以下简称"您"）与 PetConnect（以下简称"本平台"）之间关于使用本平台各项服务的法律协议。请您仔细阅读本协议，使用本平台服务即表示您同意并接受本协议全部条款。',
  },
  {
    title: '二、账号注册与安全',
    content: '1. 您在使用本平台服务前需注册账号，注册时须提供真实、准确、完整的个人信息。\n2. 您有责任妥善保管账号密码，因密码泄露等原因导致的损失由您自行承担。\n3. 未经本平台同意，不得将账号转让、出租或以其他方式允许他人使用。\n4. 如发现账号被盗用，应立即通知本平台。',
  },
  {
    title: '三、服务内容',
    content: '本平台提供宠物领养信息展示、宠物领养申请、用户社区交流等服务。本平台有权随时调整、暂停或终止部分或全部服务，并提前通知用户。',
  },
  {
    title: '四、用户行为规范',
    content: '1. 用户不得发布违法、侵权、虚假、色情、暴力等有害信息。\n2. 不得对宠物实施虐待，发布虐待动物的内容。\n3. 不得利用本平台进行任何商业活动（经平台授权除外）。\n4. 不得恶意注册账号、刷量、发布垃圾信息等扰乱平台秩序的行为。\n5. 违反上述规定的，本平台有权封禁账号并追究相关责任。',
  },
  {
    title: '五、领养规则',
    content: '1. 领养人须年满18周岁，具备完全民事行为能力。\n2. 领养申请需经平台审核，平台有权拒绝不符合条件的申请。\n3. 领养成功后，领养人须承担对宠物的照料义务，不得随意遗弃。\n4. 平台保留对领养情况进行回访的权利。',
  },
  {
    title: '六、知识产权',
    content: '本平台上的所有内容，包括文字、图片、音频、视频等，受著作权法及其他知识产权法律保护。未经授权，不得复制、传播或商业使用。用户上传的内容，用户保留所有权，但授予本平台非独家的使用权。',
  },
  {
    title: '七、免责声明',
    content: '本平台对宠物信息的真实性尽到合理审查义务，但不对领养结果承担保证责任。因不可抗力、网络故障等原因导致服务中断的，本平台不承担责任。',
  },
  {
    title: '八、协议变更',
    content: '本平台保留修改本协议的权利，修改后的协议将在平台公告后生效。继续使用本平台服务视为您接受修改后的协议。',
  },
  {
    title: '九、争议解决',
    content: '本协议适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，提交本平台所在地有管辖权的人民法院诉讼解决。',
  },
];

const UserAgreement: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">用户协议</h1>
      </header>

      <main className="p-6 space-y-5 pb-10">
        <div className="text-center space-y-1 pb-2">
          <h2 className="text-base font-bold text-gray-900">PetConnect 用户服务协议</h2>
          <p className="text-xs text-gray-400">更新日期：2026年2月18日 · 版本：1.0</p>
        </div>

        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{section.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400">如有疑问，请联系 support@petconnect.app</p>
      </main>
    </div>
  );
};

export default UserAgreement;
