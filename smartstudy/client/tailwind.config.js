export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:'#4B78FF',
        accent:'#FFB661',
        emerald:'#57C785',
        plum:'#7C5CFF',
        slate:'#1D1F2C',
        muted:'#7D8CA3',
        card:'#FFFFFF',
        'bg-soft':'#F4F7FB',
        border:'#E5E9F2',
        error:'#E57373'
      },
      fontFamily: {
        title:['Poppins','sans-serif'],
        body:['Inter','sans-serif'],
        label:['Sora','sans-serif']
      },
      borderRadius: {
        'mdplus':'14px',
        xl:'24px'
      },
      boxShadow: {
        soft:'0 15px 40px rgba(14, 33, 90, 0.08)',
        inset:'inset 0 1px 0 rgba(255,255,255,0.4)'
      }
    }
  }, plugins: []
}
