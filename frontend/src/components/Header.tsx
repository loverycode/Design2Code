import React, {useState} from  'react';

interface HeaderProps {
  className?: string;
}

interface DropDownState{
    Projects: boolean;
    Community: boolean;
    Learn: boolean;
    Resources: boolean;
}

const Header: React.FC<HeaderProps>=({className})=>{
    const [openDropDown, setOpenDropDown] = useState<DropDownState>({
        Projects: false,
        Community: false,
        Learn:false,
        Resources: false,
        })
    const toggleDropDown=(item: keyof DropDownState)=>
        {setOpenDropDown(prev =>({...prev, [item]: !prev[item] }));
    };
    return(
        <header className={`bg-white border-b sticky top-0 z-10 ${className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                    <div>
                        <p className="font-bold text-gray-800">Swagger</p>
                        <p className="text-xs text-gray-500">Supported by Design2Code</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    {(['Projects', 'Community', 'Learn', 'Resources'] as const).map((item)=>(
                        <div key={item} className="relative">
                            <div className="flex items-center gap-1 cursor-pointer" onClick={()=>toggleDropDown(item)}>
                                <span className="text-gray-700 hover:text-purple-600 cursor-pointer text-sm">
                                    {item}
                                </span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDropDown[item] ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-gray-700 hover:text-purple-600 text-sm">Sign In</button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-600 text-purple-600transition text-gray-700 hover:text-purple-600 text-sm">Get started</button>
                </div>
            </div>
        </header>
    );
};

export default Header;