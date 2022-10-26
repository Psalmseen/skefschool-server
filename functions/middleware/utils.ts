import fs from 'fs';
export interface CourseType {
  id: number;
  name: string;
  numberOfStudents: number;
}
export const saveDataToFile = (data: CourseType[]) =>
  fs.writeFile('courses.txt', JSON.stringify(data), (err) => {
    if (err) console.log(err);
  });
