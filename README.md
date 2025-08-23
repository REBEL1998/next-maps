# Next-map project requirement 

=> Tech stack 
    - NextJS
    - AppRouting 
    - Tailwing


=> Route :: dashboard_pin  
    - It has two secton 
        - Sidebar ( Listing of data and click button event which is trigger on map and open popup )
        - Map ( Based on data draw pin , popup, map controller etc.. all maps components and functional)
    - Raw data as below 
        [
            {
                id: 1123,
                name: "Station 1",
                description: "Main monitoring station with weather sensors",
                point: [40.7128, -74.0060] // New York
            },
            {
                id: 1124,
                name: "Station 2", 
                description: "Secondary station for data collection",
                point: [34.0522, -118.2437] // Los Angeles
            }
        ]

=> Route :: dashboard_polygon 
    - Similar as dashboard_pin requirement but it will draw polygon on map and thier listing are display on siderbar 
    - Click to list it will redirect on polygon and changes its color to hightlight thier area 
    - Raw data as below 

        [
            {
                "id": 1123,
                "name": "SW19",
                "description": "SW19 is UK outcode",
                "polygon": [
                [51.421, -0.221],
                [51.430, -0.200],
                [51.440, -0.210],
                [51.435, -0.230],
                [51.421, -0.221]
                ]
            },
            {
                "id": 1124,
                "name": "NW10",
                "description": "NW10 is another UK outcode",
                "polygon": [
                [51.540, -0.260],
                [51.550, -0.240],
                [51.560, -0.250],
                [51.555, -0.270],
                [51.540, -0.260]
                ]
            },
            {
                "id": 1125,
                "name": "SE15",
                "description": "SE15 is in South London",
                "polygon": [
                [51.460, -0.070],
                [51.470, -0.060],
                [51.475, -0.080],
                [51.465, -0.085],
                [51.460, -0.070]
                ]
            }
            ]

