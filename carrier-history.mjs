// Column order follows the independently transcribed historical matrix.
export const historySlugs = ['ding','dingzhong','xiazhong','anhai','pu','xia','lunding'];
export const historyRoles = {大:'大千歲',二:'二千歲',三:'三千歲',四:'四千歲',五:'五千歲',中:'中軍府',溫:'溫府千歲'};
export const historyColors = {大:'黃色',二:'粉紅色',三:'黑色',四:'綠色',五:'紫灰色',中:'白色',溫:'藍色'};
const records = [
 [1952,'壬辰','中五四三二大溫'],
 [1955,'乙未','二中四大三五溫'],
 [1958,'戊戌','三中溫二大五四'],
 [1961,'辛丑','四三五中溫二大'],
 [1964,'甲辰','三四大中二溫五'],
 [1967,'丁未','大四二中溫五三'],
 [1970,'庚戌','三大五四溫二中'],
 [1973,'癸丑','三溫二中五大四'],
 [1976,'丙辰','四三二大五中溫'],
 [1979,'己未','二溫四大中五三'],
 [1982,'壬戌','中大四三溫二五'],
 [1985,'乙丑','大五四二三溫中'],
 [1988,'戊辰','五三大二溫四中'],
 [1991,'辛未','四二五溫三中大'],
 [1994,'甲戌','五四中三大二溫'],
 [1997,'丁丑','三中五二四大溫'],
 [2000,'庚辰','大中二四五溫三'],
 [2003,'癸未','四溫大三中二五'],
 [2006,'丙戌','五中四三大二溫'],
 [2009,'己丑','大四中三五二溫'],
 [2012,'壬辰','大中三五溫四二'],
 [2015,'乙未','五大中三四二溫'],
 [2018,'戊戌','五二溫中大三四'],
 [2021,'辛丑','大五溫二四中三'],
 [2024,'甲辰','中大三二溫四五'],
 [2027,'丁未','溫四大三二五中']
];
export const carrierHistory = records.map(([year,cycle,codes])=>{
 if(codes.length!==7 || new Set(codes).size!==7) throw new Error('Invalid history row '+year);
 return {year,cycle,assignments:Object.fromEntries(historySlugs.map((slug,i)=>[slug,{role:historyRoles[codes[i]],color:historyColors[codes[i]]}]))};
});
