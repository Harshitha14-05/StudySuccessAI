# Power BI Dashboard Guide

## Overview
This guide explains how to create a comprehensive Power BI dashboard for the Student Performance Predictor project.

## Prerequisites
- Microsoft Power BI Desktop installed
- Access to the dataset.csv file
- Basic understanding of Power BI interface

## Step 1: Import Data

1. **Open Power BI Desktop**
2. **Get Data** → **Text/CSV**
3. **Select** `dataset.csv` from your project folder
4. **Load** the data into Power BI

## Step 2: Data Preparation

### Create Calculated Columns

1. **Pass/Fail Text Column**:
   ```DAX
   Result Text = IF(dataset[result] = 1, "Pass", "Fail")
   ```

2. **Study Hours Category**:
   ```DAX
   Study Hours Category = 
   IF(dataset[hours_study] < 10, "Below 10h",
   IF(dataset[hours_study] < 15, "10-15h",
   IF(dataset[hours_study] < 20, "15-20h", "Above 20h")))
   ```

3. **Attendance Category**:
   ```DAX
   Attendance Category = 
   IF(dataset[attendance] < 60, "Below 60%",
   IF(dataset[attendance] < 80, "60-80%", "Above 80%"))
   ```

4. **Risk Level**:
   ```DAX
   Risk Level = 
   IF(dataset[result] = 0, "High Risk",
   IF(dataset[hours_study] < 10 || dataset[attendance] < 70, "Medium Risk", "Low Risk"))
   ```

## Step 3: Create Visualizations

### 1. Pass vs Fail Distribution (Pie Chart)
- **Visual**: Pie Chart
- **Legend**: Result Text
- **Values**: Count of students
- **Colors**: Green for Pass, Red for Fail

### 2. Attendance vs Performance (Clustered Bar Chart)
- **Visual**: Clustered Bar Chart
- **Axis**: Attendance Category
- **Legend**: Result Text
- **Values**: Count of students

### 3. Study Hours vs Performance (Clustered Column Chart)
- **Visual**: Clustered Column Chart
- **Axis**: Study Hours Category
- **Legend**: Result Text
- **Values**: Count of students

### 4. Feature Importance (Bar Chart)
- **Visual**: Bar Chart
- **Axis**: Feature names (manually created)
- **Values**: Importance scores (manually entered based on model coefficients)

### 5. Student Risk Analysis (Table)
- **Visual**: Table
- **Columns**: 
  - Student ID (row number)
  - Study Hours
  - Attendance
  - Previous Score
  - Result Text
  - Risk Level
- **Conditional Formatting**: Red background for High Risk students

### 6. Scatter Plot Analysis
- **Visual**: Scatter Chart
- **X-Axis**: hours_study
- **Y-Axis**: previous_score
- **Legend**: Result Text
- **Size**: attendance (optional)

## Step 4: Dashboard Layout

### Page 1: Overview Dashboard
```
┌─────────────────┬─────────────────┐
│   Pass/Fail     │   Attendance    │
│   Distribution  │   Performance   │
│   (Pie Chart)   │   (Bar Chart)   │
├─────────────────┼─────────────────┤
│   Study Hours   │   Feature       │
│   Performance   │   Importance    │
│   (Column Chart)│   (Bar Chart)   │
└─────────────────┴─────────────────┘
```

### Page 2: Student Analysis
```
┌─────────────────────────────────────┐
│        Student Risk Table           │
│     (with conditional formatting)   │
├─────────────────────────────────────┤
│        Scatter Plot Analysis        │
│    (Study Hours vs Previous Score)  │
└─────────────────────────────────────┘
```

## Step 5: Add Interactivity

1. **Slicers**: Add slicers for:
   - Study Hours Category
   - Attendance Category
   - Result Text

2. **Cross-filtering**: Enable cross-filtering between visuals

3. **Drill-through**: Create drill-through pages for detailed student analysis

## Step 6: Formatting and Styling

### Color Scheme
- **Pass**: #48bb78 (Green)
- **Fail**: #f56565 (Red)
- **Background**: #667eea to #764ba2 (Gradient)
- **Text**: White/Light colors

### Fonts
- **Title**: Segoe UI, Bold, 18pt
- **Labels**: Segoe UI, Regular, 12pt
- **Data**: Segoe UI, Regular, 10pt

## Step 7: Save and Export

1. **Save** the file as `dashboard.pbix`
2. **Publish** to Power BI Service (optional)
3. **Export** as PDF for presentations

## Integration with Flask App

### Presentation Workflow
1. **Run Flask App**: Start the prediction system
2. **Open Power BI**: Launch the dashboard
3. **Present Together**: 
   - Use Flask app for individual predictions
   - Use Power BI for class-level insights
   - Switch between both during presentations

### Data Synchronization
- **Manual**: Update dataset.csv and refresh Power BI
- **Automatic**: Set up scheduled refresh in Power BI Service
- **Real-time**: Use Power BI streaming datasets (advanced)

## Sample DAX Measures

### Pass Rate
```DAX
Pass Rate = 
DIVIDE(
    CALCULATE(COUNT(dataset[result]), dataset[result] = 1),
    COUNT(dataset[result])
) * 100
```

### Average Study Hours by Result
```DAX
Avg Study Hours (Pass) = 
CALCULATE(
    AVERAGE(dataset[hours_study]),
    dataset[result] = 1
)
```

### Risk Students Count
```DAX
High Risk Students = 
CALCULATE(
    COUNT(dataset[result]),
    dataset[Risk Level] = "High Risk"
)
```

## Tips for Effective Dashboard

1. **Keep it Simple**: Don't overcrowd with too many visuals
2. **Use Consistent Colors**: Maintain color scheme throughout
3. **Add Context**: Include titles and descriptions
4. **Mobile Friendly**: Design for mobile viewing
5. **Regular Updates**: Keep data current
6. **User Training**: Train teachers on how to interpret the dashboard

## Troubleshooting

### Common Issues
1. **Data not loading**: Check CSV file format and location
2. **Visuals not updating**: Refresh data source
3. **Performance issues**: Reduce data size or optimize queries
4. **Color not applying**: Check conditional formatting rules

### Performance Optimization
- Use calculated columns instead of measures where possible
- Limit data to relevant time periods
- Use aggregated data for large datasets
- Optimize DAX formulas

## Advanced Features

### Bookmarks
Create bookmarks for different views:
- Overview
- Risk Analysis
- Performance Trends

### Custom Visuals
Consider adding:
- Gauge charts for pass rates
- Waterfall charts for performance factors
- Custom scatter plots with trend lines

### Alerts
Set up alerts for:
- Low pass rates
- High number of risk students
- Attendance drops

This comprehensive Power BI dashboard will provide valuable insights alongside your Flask prediction application!