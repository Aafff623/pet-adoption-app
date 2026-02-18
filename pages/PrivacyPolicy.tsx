import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PolicySection {
  title: string;
  content: string;
  icon: string;
}

const sections: PolicySection[] = [
  {
    icon: 'info',
    title: '一、我们收集的信息',
    content: '为向您提供服务，我们可能收集以下信息：\n· 账号信息：注册时提供的昵称、邮箱、手机号等\n· 使用数据：您的浏览记录、收藏、申请记录等\n· 设备信息：设备型号、操作系统、网络状态等\n· 位置信息：在您授权时获取大致地理位置，用于推荐附近宠物',
  },
  {
    icon: 'manage_search',
    title: '二、信息的使用',
    content: '收集的信息仅用于：\n· 提供、维护和改善我们的服务\n· 个性化您的使用体验\n· 发送服务通知和重要更新\n· 防止欺诈和保障账号安全\n· 遵守法律法规要求\n\n我们不会将您的个人信息出售给第三方。',
  },
  {
    icon: 'share',
    title: '三、信息的共享',
    content: '在以下情形下，我们可能共享您的信息：\n· 经您明确同意\n· 与宠物救助机构共享领养相关信息（需您授权）\n· 法律法规要求或政府部门依法请求\n· 为保护平台、用户或公众的合法权益\n\n合作方须遵守严格的保密义务。',
  },
  {
    icon: 'lock',
    title: '四、信息安全',
    content: '我们采取多项安全措施保护您的信息：\n· 数据传输采用 SSL/TLS 加密\n· 密码以加密形式存储，不可逆\n· 定期安全审计和漏洞扫描\n· 严格的员工数据访问权限控制\n\n尽管如此，互联网数据传输无法保证100%安全，请您妥善保管账号密码。',
  },
  {
    icon: 'child_care',
    title: '五、未成年人保护',
    content: '本平台不面向14周岁以下未成年人。若发现有未成年人注册账号，我们将及时删除相关信息。18周岁以下用户使用本服务需征得监护人同意。',
  },
  {
    icon: 'settings',
    title: '六、您的权利',
    content: '您有权：\n· 访问和更正您的个人信息\n· 删除您的账号和相关数据\n· 撤回授权同意\n· 获取个人数据副本\n· 对数据处理方式提出异议\n\n如需行使以上权利，请联系 privacy@petconnect.app',
  },
  {
    icon: 'cookie',
    title: '七、Cookie 使用',
    content: '我们使用 Cookie 和类似技术记录您的偏好设置、登录状态等，以提升使用体验。您可以在浏览器设置中禁用 Cookie，但这可能影响部分功能的正常使用。',
  },
  {
    icon: 'update',
    title: '八、政策更新',
    content: '我们可能不定期更新本隐私政策。重大变更将通过应用内通知或邮件方式告知您。继续使用本服务表示您接受更新后的政策。',
  },
];

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-lg font-bold text-gray-900 ml-2">隐私政策</h1>
      </header>

      <main className="p-6 space-y-5 pb-10">
        <div className="bg-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-icons-round text-primary text-2xl mt-0.5">privacy_tip</span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">PetConnect 隐私政策</h2>
            <p className="text-xs text-gray-500 mt-1">更新日期：2026年2月18日 · 版本：1.0</p>
            <p className="text-xs text-gray-600 mt-2">我们重视您的隐私，请仔细阅读以了解我们如何处理您的个人信息。</p>
          </div>
        </div>

        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-round text-primary text-base">{section.icon}</span>
              <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center space-y-1">
          <p className="text-xs text-gray-500">如有隐私相关问题，请联系</p>
          <p className="text-sm font-medium text-primary">privacy@petconnect.app</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
