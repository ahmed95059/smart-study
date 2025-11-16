export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary:'#4B78FF',
        accent:'#FFB661',
        emerald:'#57C785',
        plum:'#7C5CFF',
        slate:'#1D1F2C',
        muted:'#7D8CA3',
        card:'#FFFFFF',
        'bg-soft':'#F4F7FB',
        border:'#E5E9F2',
        error:'#E57373',
        // Dark mode colors - improved for better visibility
        'dark-bg':'#0A0E1A',
        'dark-card':'#1A1F35',
        'dark-border':'#2D3547',
        'dark-slate':'#E5E7EB',
        'dark-muted':'#9CA3AF',
        'dark-primary':'#6B8EFF',
        'dark-accent':'#FFB661'
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
        inset:'inset 0 1px 0 rgba(255,255,255,0.4)',
        'dark-soft':'0 15px 40px rgba(0, 0, 0, 0.3)'
      }
    }
  }, 
  plugins: []
}
