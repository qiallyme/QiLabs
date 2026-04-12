#!/usr/bin/env python3
"""
Generate comprehensive BMV questions from Indiana Driver's Manual
This script creates a TypeScript file with ~500 questions covering all topics
"""

questions = []

# Helper function to add questions
def add_q(qid, question, options, correct_idx, explanation=None):
    questions.append({
        'id': str(qid),
        'question': question,
        'options': options,
        'correctAnswer': correct_idx,
        'explanation': explanation
    })

# ===== CREDENTIALS & LICENSING =====
qid = 1
add_q(qid, "What does a star marker in the upper right-hand corner of an Indiana credential indicate?", 
      ["It's a probationary license", "It's Real ID-compliant", "It's expired", "It's a temporary credential"], 
      1, "A star marker indicates the credential is Real ID-compliant and may be used for federal purposes.")

qid += 1
add_q(qid, "How long is a learner's permit valid in Indiana?", 
      ["1 year", "2 years", "3 years", "4 years"], 
      1, "Learner's permits are valid for two years from the date of issuance.")

qid += 1
add_q(qid, "What is the minimum age to apply for a learner's permit in Indiana?", 
      ["14 years", "15 years", "16 years", "17 years"], 
      1, "You may apply for a learner's permit at 15 years of age if enrolled in driver education, or 16 years otherwise.")

qid += 1
add_q(qid, "How long must you hold a learner's permit before applying for a driver's license?", 
      ["90 days", "120 days", "180 days", "270 days"], 
      2, "You must hold a valid Indiana learner's permit for at least 180 days before applying for a driver's license.")

qid += 1
add_q(qid, "What is the validity period of a driver's license for someone under 75 years of age?", 
      ["3 years", "4 years", "6 years", "8 years"], 
      2, "A driver's license is valid for six years if you are younger than 75 years of age.")

qid += 1
add_q(qid, "When does a probationary driver's license expire?", 
      ["At age 18", "At age 21 and 30 days", "After 2 years", "After 4 years"], 
      1, "A probationary driver's license expires when the cardholder is 21 years and 30 days of age.")

# ===== REAL ID =====
qid += 1
add_q(qid, "What is the deadline for Real ID enforcement for boarding commercial flights?", 
      ["January 1, 2024", "May 7, 2025", "January 1, 2026", "No deadline set"], 
      1, "The Department of Homeland Security has established May 7, 2025, as the deadline for Real ID enforcement.")

qid += 1
add_q(qid, "What documents are required to obtain a Real ID-compliant credential?", 
      ["Only proof of identity", "Identity, lawful status, Social Security number, and Indiana residency", "Only a birth certificate", "Only a driver's license from another state"], 
      1, "You must provide original versions or certified copies of identity, lawful status, Social Security number, and proof of Indiana residency documents.")

# ===== RESIDENCY =====
qid += 1
add_q(qid, "How long do new Indiana residents have to obtain an Indiana driver's license?", 
      ["30 days", "60 days", "90 days", "120 days"], 
      1, "When you become an Indiana resident, you have 60 days to obtain a new Indiana driver's license.")

# ===== TRAFFIC SIGN COLORS =====
qid += 1
add_q(qid, "What do red traffic signs convey?", 
      ["Warning of hazards ahead", "Traffic regulations requiring immediate action", "Permitted movements", "Road services"], 
      1, "Red traffic signs convey traffic regulations that require drivers to take immediate action to avoid threats to traffic safety.")

qid += 1
add_q(qid, "What do yellow or fluorescent yellow-green traffic signs indicate?", 
      ["Stop required", "Regulations to obey", "Road conditions and hazards ahead", "Permitted movements"], 
      2, "Yellow or fluorescent yellow-green signs prepare drivers for specific road conditions and hazards ahead.")

qid += 1
add_q(qid, "What do white traffic signs display?", 
      ["Warning signs", "Traffic regulations and helpful information", "Recreational areas", "Road services"], 
      1, "White traffic signs display traffic regulations, such as speed limits, that drivers must obey, as well as helpful information.")

qid += 1
add_q(qid, "What do orange traffic signs warn drivers of?", 
      ["Permanent road conditions", "Temporary traffic conditions", "School zones", "Railroad crossings"], 
      1, "Orange traffic signs warn drivers of temporary traffic conditions, often used for highway construction and maintenance projects.")

qid += 1
add_q(qid, "What do green traffic signs indicate?", 
      ["Stop required", "Warning of hazards", "Permitted movements and directions or guidance", "Road services"], 
      2, "Green traffic signs indicate permitted movements and directions or guidance, such as highway entrances and exits.")

qid += 1
add_q(qid, "What do blue traffic signs display?", 
      ["Traffic regulations", "Road services and information", "Warning signs", "Recreational areas"], 
      1, "Blue traffic signs display road services and information.")

qid += 1
add_q(qid, "What do brown traffic signs indicate?", 
      ["School zones", "Nearby recreational and cultural interest sites", "Construction zones", "Railroad crossings"], 
      1, "Brown traffic signs indicate nearby recreational and cultural interest sites.")

# ===== TRAFFIC SIGN SHAPES =====
qid += 1
add_q(qid, "What does a circular traffic sign alert drivers to?", 
      ["Stop required", "Upcoming railroad crossings", "Yield right of way", "No passing zone"], 
      1, "Circular traffic signs alert drivers to upcoming railroad crossings.")

qid += 1
add_q(qid, "What does an equilateral triangle traffic sign warn drivers to do?", 
      ["Stop", "Slow down when approaching an intersection and be prepared to stop", "Yield to oncoming traffic only", "Proceed with caution"], 
      1, "Traffic signs with three sides of equal length warn drivers to slow down when approaching an intersection and be prepared to come to a complete stop.")

qid += 1
add_q(qid, "What do pennant-shaped traffic signs indicate?", 
      ["School zone ahead", "No passing zone on the left", "Railroad crossing", "Construction ahead"], 
      1, "Pennant-shaped traffic signs are posted on the left-hand side of two-way roads to warn drivers not to pass other vehicles on the left.")

qid += 1
add_q(qid, "What do diamond-shaped traffic signs warn drivers of?", 
      ["Stop required", "Upcoming road conditions and hazards", "Permitted movements", "Road services"], 
      1, "Diamond-shaped traffic signs warn drivers of upcoming road conditions and hazards.")

qid += 1
add_q(qid, "What do five-sided traffic signs warn drivers about?", 
      ["Railroad crossings", "School areas where children may be crossing", "Construction zones", "No passing zones"], 
      1, "Five-sided traffic signs warn drivers that they are entering an area near a school in which children may be crossing the road.")

qid += 1
add_q(qid, "What do eight-sided traffic signs mean?", 
      ["Yield right of way", "Stop and yield the appropriate right of way", "No entry", "Slow down"], 
      1, "Eight-sided traffic signs warn drivers that they must stop and yield the appropriate right of way at an intersection.")

# ===== TRAFFIC SIGNALS =====
qid += 1
add_q(qid, "What does a green light mean?", 
      ["Stop", "Go - you have the right of way", "Slow down", "Yield"], 
      1, "A green light means go. If you are facing a green light, you have the right of way and may drive through an intersection as long as it is clear.")

qid += 1
add_q(qid, "What does a steady yellow light mean?", 
      ["Go faster", "The green light has ended and the signal is about to turn red", "Stop immediately", "Yield to oncoming traffic"], 
      1, "A steady yellow light means the green light has ended and the signal is about to turn red.")

qid += 1
add_q(qid, "What does a red light mean?", 
      ["Slow down", "Stop - traffic from other directions has the right of way", "Proceed with caution", "Yield"], 
      1, "A red light means stop. Traffic entering an intersection from other directions has the right of way.")

qid += 1
add_q(qid, "When may you turn right on a red light?", 
      ["Always", "Never", "After coming to a full stop and checking for traffic and pedestrians, if not prohibited by a sign", "Only at intersections with no traffic"], 
      2, "You may turn right on red after coming to a full stop, checking for vehicles and pedestrians, and ensuring there is no 'No Turn on Red' sign.")

qid += 1
add_q(qid, "When may you turn left on a red light?", 
      ["Never", "Always", "When turning from a one-way street onto a one-way street", "Only at night"], 
      2, "You may turn left through an intersection with a red light if you are turning from a one-way street onto a one-way street, after coming to a full stop.")

qid += 1
add_q(qid, "What does a yellow flashing light at an intersection mean?", 
      ["Stop immediately", "Slow down and use caution", "Yield to all traffic", "Proceed at normal speed"], 
      1, "A yellow flashing light displayed without an arrow at an intersection means you should slow down and use caution when traveling through.")

qid += 1
add_q(qid, "What does a red flashing light at an intersection mean?", 
      ["Slow down", "Equivalent to a stop sign - come to a complete stop", "Yield", "Proceed with caution"], 
      1, "A red flashing light at an intersection is equivalent to a stop sign and means you must come to a complete stop before proceeding.")

# ===== SPEED LIMITS =====
qid += 1
add_q(qid, "What is the maximum speed limit for passenger vehicles on rural interstate highways?", 
      ["55 mph", "60 mph", "65 mph", "70 mph"], 
      3, "Passenger vehicles may not exceed 70 miles per hour or the posted speed limit on rural interstate highways.")

qid += 1
add_q(qid, "What is the maximum speed limit for trucks over 26,000 pounds on rural interstate highways?", 
      ["55 mph", "60 mph", "65 mph", "70 mph"], 
      2, "Trucks with a declared gross vehicle weight greater than 26,000 pounds may not exceed 65 miles per hour on rural interstate highways.")

qid += 1
add_q(qid, "What is the speed limit on rural state divided highways?", 
      ["50 mph", "55 mph", "60 mph", "65 mph"], 
      2, "On a rural state divided highway, vehicles may not exceed 60 miles per hour or the posted speed limit.")

qid += 1
add_q(qid, "What is the speed limit on urban interstate highways?", 
      ["50 mph", "55 mph", "60 mph", "65 mph"], 
      1, "On an urban interstate highway, vehicles may not exceed 55 miles per hour or the posted speed limit.")

qid += 1
add_q(qid, "What is the speed limit in most urban residential areas?", 
      ["20 mph", "25 mph", "30 mph", "35 mph"], 
      2, "In most urban residential areas, vehicles may not exceed 30 miles per hour or the posted speed limit.")

qid += 1
add_q(qid, "What is the speed limit in alleys?", 
      ["10 mph", "15 mph", "20 mph", "25 mph"], 
      1, "In alleys, vehicles may not exceed 15 miles per hour or the posted speed limit.")

qid += 1
add_q(qid, "What is the maximum speed limit for school buses when not on an interstate or state highway?", 
      ["30 mph", "35 mph", "40 mph", "45 mph"], 
      2, "When not driving on an interstate or state highway, the maximum speed limit for a school bus is 40 miles per hour unless the posted speed limit is lower.")

qid += 1
add_q(qid, "What is the maximum speed limit for school buses on an interstate or highway?", 
      ["50 mph", "55 mph", "60 mph", "65 mph"], 
      2, "The maximum speed limit for a school bus on an interstate or highway is 60 miles per hour or the posted speed limit.")

# ===== HEADLIGHTS =====
qid += 1
add_q(qid, "When must drivers use headlights?", 
      ["Only at night", "Between sunset and sunrise, and when visibility is less than 500 feet", "Only in bad weather", "Only on highways"], 
      1, "Drivers must use headlights between sunset and sunrise as well as at any other time in which visibility is less than 500 feet.")

qid += 1
add_q(qid, "When must lower headlight beams be used when approaching oncoming traffic?", 
      ["Within 100 feet", "Within 200 feet", "Within 300 feet", "Within 500 feet"], 
      3, "When headlights are on, lower headlight beams must be used when approaching within 500 feet of an oncoming vehicle.")

qid += 1
add_q(qid, "When must lower headlight beams be used when following another vehicle?", 
      ["Within 50 feet", "Within 100 feet", "Within 200 feet", "Within 300 feet"], 
      2, "When headlights are on, lower headlight beams must be used when following within 200 feet of the rear of another vehicle.")

# ===== LANE MARKINGS =====
qid += 1
add_q(qid, "What do yellow lane markings separate?", 
      ["Lanes going in the same direction", "Multiple lanes of traffic going in opposite directions", "Bike lanes", "Parking areas"], 
      1, "Yellow lane markings separate multiple lanes of traffic going in opposite directions.")

qid += 1
add_q(qid, "When may you cross a broken yellow line?", 
      ["Never", "To pass another vehicle when it is safe", "Only to turn left", "Only in emergency"], 
      1, "You may cross a broken yellow line to pass another vehicle when it is safe.")

qid += 1
add_q(qid, "When may you cross a solid yellow line?", 
      ["To pass another vehicle", "Only to turn", "Never", "When safe"], 
      1, "You should not cross a solid yellow line except to turn.")

qid += 1
add_q(qid, "What do white lane markings separate?", 
      ["Lanes going in opposite directions", "Multiple lanes of traffic going in the same direction", "Bike lanes only", "Parking areas"], 
      1, "White lane markings separate multiple lanes of traffic going in the same direction.")

qid += 1
add_q(qid, "What does a solid white line between lanes mean?", 
      ["Lane changes are prohibited", "Lane changes are discouraged", "You must change lanes", "It's only a suggestion"], 
      1, "A solid white line indicates that lane changes are discouraged but not prohibited. A double solid white line means lane changes are prohibited.")

# ===== CHANGING LANES & PASSING =====
qid += 1
add_q(qid, "How many lanes should you change at a time?", 
      ["One", "Two", "As many as needed", "It doesn't matter"], 
      0, "Change only one lane at a time.")

qid += 1
add_q(qid, "How far before an oncoming vehicle must you return to the right side of the road when passing?", 
      ["50 feet", "75 feet", "100 feet", "150 feet"], 
      2, "You must return to the right side of the road no less than 100 feet before any oncoming vehicle.")

qid += 1
add_q(qid, "When is it illegal to pass other vehicles?", 
      ["When a solid yellow line is on your side", "When a pennant-shaped 'No Passing Zone' sign is posted", "Within 100 feet of an intersection", "All of the above"], 
      3, "It is dangerous and illegal to pass in all these situations: solid yellow line on your side, no passing zone signs, and within 100 feet of intersections.")

# ===== TURNING =====
qid += 1
add_q(qid, "How far before turning should you signal?", 
      ["50 feet", "75 feet", "100 feet", "150 feet"], 
      2, "You must give a proper turn signal before turning or changing lanes, typically at least 100 feet before.")

qid += 1
add_q(qid, "When making a left turn from a two-way road, which lane should you turn into?", 
      ["The right lane", "The left lane", "Any lane", "The lane nearest to the direction you're turning"], 
      3, "To turn left, be in the far-left lane for your direction of travel. Turn into the lane nearest to the direction you're turning.")

qid += 1
add_q(qid, "When making a right turn, which lane should you turn into?", 
      ["The left lane", "The right lane", "Any lane", "The center lane"], 
      1, "To turn right, be in the far-right lane for your direction of travel.")

qid += 1
add_q(qid, "When is it legal to make a U-turn?", 
      ["Always", "Never", "When not prohibited by law and it's safe", "Only on highways"], 
      2, "A U-turn is potentially dangerous and should only be undertaken when not prohibited by law.")

qid += 1
add_q(qid, "Where are U-turns never permitted?", 
      ["On city streets", "On curves, when approaching the crest of a hill, or on interstate highways", "In parking lots", "At intersections"], 
      1, "Never make a U-turn on a curve in the road, when approaching the crest of a hill, or on an interstate highway.")

# ===== ROUNDABOUTS =====
qid += 1
add_q(qid, "When approaching a roundabout, who has the right of way?", 
      ["Incoming traffic", "Circulating traffic", "The larger vehicle", "The first to arrive"], 
      1, "When approaching a roundabout, incoming traffic always yields to the circulating traffic.")

qid += 1
add_q(qid, "In what direction does traffic flow in a roundabout?", 
      ["Clockwise", "Counterclockwise", "Either direction", "Depends on the roundabout"], 
      1, "A roundabout is a circular intersection in which traffic enters or exits only through right turns and proceeds in a counterclockwise direction.")

# ===== FOLLOWING DISTANCE =====
qid += 1
add_q(qid, "What is the recommended minimum following distance?", 
      ["1 second", "2 seconds", "3 seconds", "4 seconds"], 
      2, "A good rule for drivers to follow is to stay at least two to three seconds behind the vehicle ahead.")

qid += 1
add_q(qid, "How should you increase following distance in adverse conditions?", 
      ["Stay the same", "Increase to 4-5 seconds", "Decrease to 1 second", "It doesn't matter"], 
      1, "You should increase following distance in adverse weather conditions, on slick roads, or when visibility is poor.")

# ===== SCHOOL BUSES =====
qid += 1
add_q(qid, "When must you stop for a school bus?", 
      ["When amber lights are flashing", "When red lights are flashing and stop arm is extended", "Only if children are visible", "Never"], 
      1, "You must stop when you approach a school bus with flashing red lights activated and stop arm extended.")

qid += 1
add_q(qid, "On a roadway divided by a barrier or unimproved median, when must you stop for a school bus?", 
      ["Always", "Only if traveling in the same direction as the bus", "Never", "Only if children are visible"], 
      1, "If you are driving on a roadway divided by a barrier or unimproved median, you are required to stop only if you are traveling in the same direction as the school bus.")

qid += 1
add_q(qid, "What do amber flashing lights on a school bus indicate?", 
      ["Stop immediately", "The bus is slowing and going to load or unload children", "The bus is turning", "Emergency situation"], 
      1, "When the school bus driver activates the amber lights, he or she is warning other drivers that the bus is slowing and is going to load or unload children.")

# ===== RAILROAD CROSSINGS =====
qid += 1
add_q(qid, "Which vehicles must always stop at railroad crossings?", 
      ["All vehicles", "Only large trucks", "Vehicles carrying passengers for hire, school buses, and vehicles carrying explosives", "Only commercial vehicles"], 
      2, "All vehicles carrying passengers for hire, all school buses, and all vehicles carrying explosives or flammable liquids must stop at railroad crossings.")

qid += 1
add_q(qid, "How close to the nearest rail must certain vehicles stop at railroad crossings?", 
      ["5-15 feet", "10-20 feet", "15-50 feet", "20-60 feet"], 
      2, "Vehicles required to stop must stop not closer than 15 feet or farther than 50 feet from the nearest rail.")

qid += 1
add_q(qid, "What should you do if your vehicle stalls on railroad tracks?", 
      ["Stay in the vehicle", "All occupants should immediately leave the vehicle", "Try to restart the engine", "Wait for help"], 
      1, "If your vehicle stalls on the tracks, all occupants should immediately leave the vehicle.")

qid += 1
add_q(qid, "Is it legal to drive around a crossing gate that is down?", 
      ["Yes, if no train is visible", "Yes, if you're in a hurry", "No, it is illegal", "Only in emergency"], 
      2, "It is illegal to drive around a crossing gate that is down.")

qid += 1
add_q(qid, "How far from a railroad crossing should you not pass another vehicle?", 
      ["50 feet", "75 feet", "100 feet", "150 feet"], 
      2, "Do not pass another vehicle within 100 feet of a railroad crossing.")

# ===== WORK ZONES =====
qid += 1
add_q(qid, "How much below the maximum speed limit are work site speed limits?", 
      ["At least 5 mph", "At least 10 mph", "At least 15 mph", "At least 20 mph"], 
      1, "Work site speed limits are always at least 10 miles per hour below the maximum established speed limit for the area.")

qid += 1
add_q(qid, "What should you do when a flagger extends a fluorescent orange/red flag horizontally?", 
      ["Slow down", "Stop", "Proceed with caution", "Speed up"], 
      1, "You must stop when a flagger extends a fluorescent orange/red flag in a horizontal position into the line of traffic.")

# ===== PARKING =====
qid += 1
add_q(qid, "When parking downhill, which way should you turn your wheels?", 
      ["Away from the curb", "Toward the curb", "Straight ahead", "It doesn't matter"], 
      1, "When parking downhill, turn your wheels toward the curb so the vehicle will roll into the curb if the brakes fail.")

qid += 1
add_q(qid, "When parking uphill, which way should you turn your wheels?", 
      ["Away from the curb", "Toward the curb", "Straight ahead", "It doesn't matter"], 
      0, "When parking uphill, turn your wheels away from the curb.")

qid += 1
add_q(qid, "How close to a fire hydrant may you park?", 
      ["5 feet", "10 feet", "15 feet", "20 feet"], 
      2, "Parking is prohibited within 15 feet of a fire hydrant or in fire lanes.")

qid += 1
add_q(qid, "Is parking allowed in the diagonally striped area next to accessible parking spaces?", 
      ["Yes, if you have a placard", "Yes, for short periods", "No, it is prohibited at all times", "Only at night"], 
      2, "Parking in the diagonally striped space next to a reserved parking space is prohibited at all times, even with a valid placard.")

# ===== SEAT BELTS =====
qid += 1
add_q(qid, "Who is required to wear seat belts in Indiana?", 
      ["Only the driver", "Driver and front-seat passengers", "Driver and all passengers", "Only children"], 
      2, "Indiana law requires a driver and all passengers to use seat belts at all times when a vehicle is in operation.")

qid += 1
add_q(qid, "At what age are children required to be in a child restraint system?", 
      ["Under 5 years", "Under 6 years", "Under 8 years", "Under 12 years"], 
      2, "Passengers younger than eight years of age are required by law to be properly secured in a child restraint system.")

qid += 1
add_q(qid, "Where should children under 12 years of age sit in a vehicle with a passenger air bag?", 
      ["Front seat", "Back seat", "Either seat", "It doesn't matter"], 
      1, "The National Safety Council recommends putting children younger than 12 years of age in the back seat if the car is equipped with a passenger air bag.")

# ===== IMPAIRED DRIVING =====
qid += 1
add_q(qid, "What is the legal blood alcohol concentration (BAC) limit for drivers 21 and over in Indiana?", 
      ["0.05%", "0.08%", "0.10%", "0.12%"], 
      1, "In Indiana, a BAC of 0.08% or higher is considered legally intoxicated for drivers 21 and over.")

qid += 1
add_q(qid, "What happens if you fail a chemical test for alcohol?", 
      ["Warning only", "180-day suspension of driving privileges", "1-year suspension", "2-year suspension"], 
      1, "A motorist who fails a chemical test will face a suspension of driving privileges for 180 days.")

qid += 1
add_q(qid, "What happens if you refuse to submit to a chemical test?", 
      ["No penalty", "180-day suspension", "1-year suspension", "2-year suspension"], 
      2, "A motorist who refuses to submit to a chemical test will face a suspension of driving privileges for one year.")

# ===== DISTRACTED DRIVING =====
qid += 1
add_q(qid, "Is it legal to text while driving in Indiana?", 
      ["Yes, always", "No, it is illegal", "Only at stop lights", "Only on highways"], 
      1, "Indiana law specifically prohibits the use of a telecommunications device, including texting, while operating a motor vehicle.")

qid += 1
add_q(qid, "When may you use a telecommunications device while driving?", 
      ["Never", "When hands-free communication is enabled or for 911 emergency calls", "Only at stop lights", "Only on city streets"], 
      1, "The only exceptions to the prohibition are when hands-free communication is enabled or if the device is being used to contact 911 for a bona fide emergency.")

# ===== EMERGENCY VEHICLES =====
qid += 1
add_q(qid, "What must you do when approaching an emergency vehicle with flashing lights?", 
      ["Slow down to 10 mph under the posted limit", "Change lanes away from the vehicle if possible", "Both of the above", "Continue at normal speed"], 
      2, "Motorists must change lanes away from the authorized vehicle. If you cannot move over, reduce speed to 10 mph under the posted limit and proceed with caution.")

qid += 1
add_q(qid, "What types of vehicles are considered authorized emergency vehicles?", 
      ["Only police and fire", "Police, fire, ambulances, and other designated vehicles", "Only ambulances", "Only police"], 
      1, "Authorized emergency vehicles include fire department vehicles, police department vehicles, ambulances, and other vehicles designated by law.")

# ===== ACCIDENTS =====
qid += 1
add_q(qid, "What must you do if involved in an accident?", 
      ["Leave immediately", "Stop immediately and remain at the scene", "Call 911 only if someone is hurt", "Move your vehicle off the road immediately"], 
      1, "The driver of a motor vehicle involved in an accident must stop immediately or as close as possible to the scene and remain at the scene.")

qid += 1
add_q(qid, "What information must you provide after an accident?", 
      ["Only your name", "Name, address, and registration number", "Only insurance information", "Nothing if no one is hurt"], 
      1, "You must give your name, address, and registration number of the motor vehicle to everyone involved, and show your driver's license.")

qid += 1
add_q(qid, "When should you move your vehicle after an accident?", 
      ["Always", "Never", "If the accident occurs on the traveled portion of a highway, move off the highway unless it involves hazardous materials, injury, death, or entrapment", "Only if told by police"], 
      2, "If the accident occurs on the traveled portion of a highway, move the vehicle off the highway unless it involves hazardous materials, injury, death, or entrapment.")

# ===== TIRE BLOWOUT =====
qid += 1
add_q(qid, "What should you do in a situation with a flat tire or blowout?", 
      ["Apply the brakes immediately", "Hold the steering wheel firmly and keep the car going straight, slow down gradually", "Speed up to get off the road", "Turn the steering wheel sharply"], 
      1, "In a situation with a flat tire or blowout, hold the steering wheel firmly and keep the car going straight. Slow down gradually. Take your foot off the gas pedal, but do not apply the brakes.")

# ===== BRAKE FAILURE =====
qid += 1
add_q(qid, "What should you do if your vehicle's brakes suddenly fail?", 
      ["Panic and stop immediately", "Shift to a lower gear and pump the brake pedal fast and hard", "Use only the parking brake", "Turn off the engine"], 
      1, "If your vehicle's conventional disc or drum brakes suddenly fail, shift to a lower gear and pump the brake pedal fast and hard several times.")

# ===== PROBATIONARY LICENSE RESTRICTIONS =====
qid += 1
add_q(qid, "For the first 180 days after obtaining a probationary driver's license, when may you not drive?", 
      ["Between 9 p.m. and 6 a.m.", "Between 10 p.m. and 5 a.m.", "Between 11 p.m. and 6 a.m.", "Between midnight and 5 a.m."], 
      1, "For the first 180 days after obtaining a probationary driver's license, you may not drive between 10 p.m. and 5 a.m.")

qid += 1
add_q(qid, "For the first 180 days after obtaining a probationary driver's license, who may ride with you?", 
      ["Anyone", "No passengers unless a licensed driver 25 or older, spouse 21 or older, or instructor is in the front seat", "Only family members", "Only one passenger"], 
      1, "You may not drive with any passengers for the first 180 days unless a licensed individual 25 or older, spouse 21 or older, or instructor is in the front passenger seat.")

# ===== INSURANCE =====
qid += 1
add_q(qid, "What is the minimum liability insurance requirement in Indiana (commonly referred to as 25/50/25)?", 
      ["$15,000/$30,000/$15,000", "$25,000/$50,000/$25,000", "$30,000/$60,000/$30,000", "$50,000/$100,000/$50,000"], 
      1, "The state minimum insurance standard is $25,000 for bodily injury to one individual, $50,000 for two or more people, and $25,000 for property damage.")

# ===== POINTS =====
qid += 1
add_q(qid, "How long do points stay active on your driver record?", 
      ["1 year", "2 years", "3 years", "5 years"], 
      1, "Points stay active on your driver record for two years from the conviction date.")

qid += 1
add_q(qid, "If you are at least 21 years old and have how many active points, you must take the knowledge exam to renew?", 
      ["4 or more", "5 or more", "6 or more", "8 or more"], 
      2, "If you are at least 21 years of age and have six or more active points on your driving record, you must take the knowledge exam to renew your driver's license.")

# ===== VISION SCREENING =====
qid += 1
add_q(qid, "What restriction is placed on a license if both eyes are 20/40 when reading with glasses?", 
      ["Restriction B (Glasses required)", "Restriction F (Outside mirrors required)", "Restriction G (Daylight only)", "No restriction"], 
      0, "If both eyes are 20/40 when reading with glasses, Restriction B (Glasses or Contact Lenses) is required.")

# ===== WATER =====
qid += 1
add_q(qid, "What should you do if your vehicle plunges into water?", 
      ["Open the door immediately", "Remove seat belt, open a window, get children to front seats, exit to roof", "Stay in the vehicle", "Try to drive out"], 
      1, "If your vehicle plunges into water, remove your seat belt, open a window, get children to front seats, exit the vehicle and move to the roof.")

# ===== ADDITIONAL QUESTIONS TO REACH ~500 =====

# More Sign Questions
qid += 1
add_q(qid, "What does a 'Slippery When Wet' sign indicate?", 
      ["Road is always slippery", "Road may be slippery when wet", "Road is closed", "Speed limit ahead"], 
      1, "A 'Slippery When Wet' sign is a diamond-shaped warning sign that warns drivers of upcoming road conditions.")

qid += 1
add_q(qid, "What does a 'Deer Crossing' sign warn drivers about?", 
      ["Deer hunting area", "Area where deer may cross the road", "Deer preserve", "No deer allowed"], 
      1, "A 'Deer Crossing' sign warns drivers that they are entering an area where deer may cross the road.")

qid += 1
add_q(qid, "What does a 'Stop Ahead' sign indicate?", 
      ["Stop immediately", "A stop sign is ahead", "No stopping allowed", "Slow down only"], 
      1, "A 'Stop Ahead' sign warns drivers that a stop sign is coming up ahead.")

qid += 1
add_q(qid, "What does a 'Yield Ahead' sign indicate?", 
      ["Stop immediately", "A yield sign is ahead", "No yielding", "Speed up"], 
      1, "A 'Yield Ahead' sign warns drivers that a yield sign is coming up ahead.")

qid += 1
add_q(qid, "What does a 'No Passing Zone' sign mean?", 
      ["Passing is allowed", "Passing is prohibited", "Passing only on right", "Passing only on left"], 
      1, "A 'No Passing Zone' sign indicates that passing other vehicles is prohibited in that area.")

qid += 1
add_q(qid, "What does a 'Do Not Enter' sign mean?", 
      ["Slow down", "You may not enter this road", "Enter with caution", "One-way street"], 
      1, "A 'Do Not Enter' sign means you may not enter the road or area where the sign is posted.")

qid += 1
add_q(qid, "What does a 'Wrong Way' sign indicate?", 
      ["You're going the right way", "You're traveling in the wrong direction", "Turn around allowed", "U-turn permitted"], 
      1, "A 'Wrong Way' sign indicates that you are traveling in the wrong direction on a one-way road or ramp.")

qid += 1
add_q(qid, "What does a 'No U-Turn' sign mean?", 
      ["U-turns are allowed", "U-turns are prohibited", "U-turns allowed at night", "U-turns allowed with signal"], 
      1, "A 'No U-Turn' sign means you may not make a U-turn at that location.")

qid += 1
add_q(qid, "What does a 'One Way' sign indicate?", 
      ["Two-way traffic", "Traffic flows in one direction only", "Turn around", "No entry"], 
      1, "A 'One Way' sign indicates that traffic on that street flows in one direction only.")

qid += 1
add_q(qid, "What does a 'School Crossing' sign indicate?", 
      ["School zone ahead", "School is closed", "No school nearby", "School bus stop"], 
      0, "A 'School Crossing' sign indicates you are entering a school zone where children may be crossing.")

# More Speed Limit Questions
qid += 1
add_q(qid, "What should you do when approaching a school zone?", 
      ["Speed up", "Slow down to the posted school zone speed limit", "Maintain current speed", "Stop immediately"], 
      1, "When driving near a school, you must slow down to the lower, posted speed limit for the school zone.")

qid += 1
add_q(qid, "What are common hours for school zone speed limits?", 
      ["6 a.m. to 8 a.m.", "7 a.m. to 4:30 p.m., Monday through Friday", "All day", "Only during school hours"], 
      1, "Common hours for school zone speed limits are 7 a.m. to 4:30 p.m., Monday through Friday, or when school speed limit beacons are flashing.")

# More Turning Questions
qid += 1
add_q(qid, "When turning left at an intersection, who must you yield to?", 
      ["No one", "Oncoming traffic and pedestrians", "Only pedestrians", "Only oncoming traffic"], 
      1, "When turning left, you must yield the right of way to all oncoming traffic and pedestrians.")

qid += 1
add_q(qid, "What should you do before making a turn?", 
      ["Speed up", "Move into the proper lane well before the turn and signal", "Honk your horn", "Turn without signaling"], 
      1, "The first rule for a safe and legal turn is to move into the proper lane well before the turn, using your turn signal.")

qid += 1
add_q(qid, "When may you use hand signals?", 
      ["Always", "When your vehicle's turn signals are malfunctioning", "Never", "Only at night"], 
      1, "If your vehicle's turn signals are malfunctioning, you may use hand signals. You may not use hand signals on a driving skills exam.")

# More Parking Questions
qid += 1
add_q(qid, "Is parking allowed on sidewalks?", 
      ["Yes", "No, parking on sidewalks is prohibited", "Only at night", "Only with a permit"], 
      1, "Parking on sidewalks is prohibited.")

qid += 1
add_q(qid, "Is parking allowed in front of driveways?", 
      ["Yes", "No, parking in front of driveways is prohibited", "Only with permission", "Only during the day"], 
      1, "Parking in front of any driveway is prohibited.")

qid += 1
add_q(qid, "Is parking allowed within intersections?", 
      ["Yes", "No, parking within intersections is prohibited", "Only at night", "Only with a permit"], 
      1, "Parking within intersections or on pedestrian crosswalks is prohibited.")

qid += 1
add_q(qid, "Is parking allowed on bridges?", 
      ["Yes", "No, parking on bridges is prohibited", "Only in emergency", "Only with a permit"], 
      1, "Parking on bridges or other elevated structures is prohibited.")

# More Following Distance Questions
qid += 1
add_q(qid, "What factors affect a vehicle's ability to stop?", 
      ["Only speed", "Weight of vehicle, type and condition of brakes, type and condition of tires, road conditions", "Only road conditions", "Only tire condition"], 
      1, "Many factors affect a vehicle's ability to stop, including weight, brakes, tires, pavement condition, slickness, and road grade.")

# More Weather Questions
qid += 1
add_q(qid, "What should you do when driving in fog?", 
      ["Use high beam headlights", "Use low beam headlights and drive cautiously at reduced speeds", "Speed up to get through quickly", "Turn off headlights"], 
      1, "In fog, use low beam headlights (high beams reflect back and reduce visibility) and drive cautiously at reduced speeds.")

qid += 1
add_q(qid, "What is hydroplaning?", 
      ["Driving through water", "When tires lose contact with the road surface due to water", "Driving in rain", "Driving through puddles"], 
      1, "Hydroplaning occurs when your vehicle's tires lose contact with the road surface and ride on a thin layer of water, oil, and dirt.")

qid += 1
add_q(qid, "What should you do to avoid hydroplaning?", 
      ["Speed up", "Slow down when there is heavy rain, standing water, or slush", "Drive in the center of the road", "Turn off headlights"], 
      1, "To avoid hydroplaning, slow down when there is heavy rain, standing water, or slush on the road, and ensure your tires have adequate tread.")

qid += 1
add_q(qid, "What should you do when driving in winter weather?", 
      ["Drive faster to get through quickly", "Clear your windows before driving, drive slowly, and watch for ice", "Use high beams only", "Turn off headlights"], 
      1, "When driving in winter weather, always clear your windows before driving, drive slowly, watch for ice (especially at intersections), and use your headlights.")

# More Intersection Questions
qid += 1
add_q(qid, "What should you do at an all-way stop?", 
      ["The first vehicle to stop proceeds first", "The largest vehicle goes first", "All vehicles go at once", "Wait for a signal"], 
      0, "At an all-way stop, the first vehicle to stop at the intersection is the first to proceed through the intersection.")

qid += 1
add_q(qid, "What should you do if you arrive at an all-way stop at the same time as another driver?", 
      ["The vehicle on the left yields", "The vehicle on the right yields", "Both proceed together", "The larger vehicle goes first"], 
      0, "If you arrive at an all-way stop at the same time as another driver, the vehicle on the left shall yield the right of way.")

qid += 1
add_q(qid, "What should you do at an intersection with a non-operating traffic signal?", 
      ["Treat it as a green light", "Stop before entering and yield to cross-traffic, vehicles that stopped before you, and pedestrians", "Proceed without stopping", "Treat it as a yield sign"], 
      1, "At an intersection with a non-operating signal, stop before entering and yield to cross-traffic that has entered, vehicles that stopped before you, and pedestrians.")

# More Highway Questions
qid += 1
add_q(qid, "What should you do when entering an interstate highway?", 
      ["Stop and wait", "Stay to the right and increase speed in the acceleration lane to merge with traffic", "Enter immediately", "Enter at any speed"], 
      1, "When entering an interstate, stay to the right and increase your speed in the acceleration lane to allow your vehicle to merge with traffic when your path is clear.")

qid += 1
add_q(qid, "Is it legal to back up on an interstate highway?", 
      ["Yes, if you miss an exit", "No, it is unsafe and illegal", "Yes, in emergency", "Yes, if no traffic"], 
      1, "It is unsafe to back up on an interstate highway to reach a missed exit. If you miss an exit, you must drive to the next exit.")

qid += 1
add_q(qid, "Is it legal to make a U-turn on an interstate highway?", 
      ["Yes", "No, it is illegal", "Yes, in emergency", "Yes, if no traffic"], 
      1, "It is illegal for any vehicle, other than an emergency vehicle or highway maintenance vehicle, to make a U-turn by crossing the median of an interstate highway.")

# More Tractor-Trailer Questions
qid += 1
add_q(qid, "How long may it take a fully loaded tractor-trailer to stop at 55 mph?", 
      ["50 feet", "100 feet", "200 feet", "400 feet or more"], 
      3, "A fully loaded tractor-trailer with hot brakes may take more than 400 feet to come to a complete stop at 55 mph.")

qid += 1
add_q(qid, "What are blind spots for a tractor-trailer driver?", 
      ["Only behind the trailer", "Up to 20 feet in front, on either side of the trailer, alongside the cab, and up to 200 feet behind", "Only in front", "There are no blind spots"], 
      1, "Blind spots for tractor-trailer drivers include up to 20 feet in front of the cab, on either side of the trailer, alongside the cab, and up to 200 feet behind the vehicle.")

qid += 1
add_q(qid, "What should you do when passing a tractor-trailer?", 
      ["Linger alongside", "Pass completely and always on the left side", "Pass on the right", "Follow closely"], 
      1, "Always pass a tractor-trailer completely and always on the left side. Do not linger when passing.")

qid += 1
add_q(qid, "What should you do if you cannot see a tractor-trailer driver's rearview mirrors?", 
      ["You're in a safe position", "The driver cannot see you - you're following too closely", "Speed up", "Change lanes"], 
      1, "When following behind a tractor-trailer, if you cannot see the driver's rearview mirrors, the driver cannot see you, meaning you're following too closely.")

# More Motorcycle Questions
qid += 1
add_q(qid, "How should you share the road with motorcycles?", 
      ["Treat them like any other vehicle - allow full lane width", "They can share your lane", "They must ride on the shoulder", "They have no special considerations"], 
      0, "Motorcyclists must be provided the same considerations as passenger motor vehicle operators. Always allow all motor vehicle operators the width of a full lane.")

qid += 1
add_q(qid, "Why might a motorcyclist suddenly change speed or position?", 
      ["They're being reckless", "They may be reacting to road conditions like potholes, gravel, or wet surfaces", "They're showing off", "No reason"], 
      1, "Motorcyclists may change speed or adjust position suddenly in reaction to road and traffic conditions, such as potholes, gravel, wet surfaces, pavement seams, and railroad crossings.")

qid += 1
add_q(qid, "What following distance should you maintain behind a motorcycle?", 
      ["Same as a car", "At least three or four seconds", "One second", "As close as possible"], 
      1, "Allow at least three or four seconds when following a motorcycle so the motorcyclist has enough time to maneuver or stop in an emergency.")

# More Bicycle Questions
qid += 1
add_q(qid, "What is the minimum safe distance when passing a bicyclist?", 
      ["1 foot", "2 feet", "3 feet", "5 feet"], 
      2, "Drivers may pass a bicyclist when there is a safe amount of room beside the bicyclist (minimum three feet) and when there is no danger from oncoming traffic.")

qid += 1
add_q(qid, "How many bicyclists may ride abreast on a roadway?", 
      ["One", "Two", "Three", "Unlimited"], 
      1, "Bicyclists may not ride more than two abreast except on paths or parts of roadways set aside for the exclusive use of bicycles.")

qid += 1
add_q(qid, "What should you do before opening a car door after parking?", 
      ["Open immediately", "Check for bicyclists first", "Only check for cars", "It doesn't matter"], 
      1, "After parking and before opening vehicle doors, a motorist should first check for bicyclists.")

# More Pedestrian Questions
qid += 1
add_q(qid, "Who has the right of way at a crosswalk?", 
      ["Drivers always", "Pedestrians always", "Whoever arrives first", "Pedestrians have the right of way"], 
      3, "Always yield the right of way to pedestrians, especially at crosswalks.")

qid += 1
add_q(qid, "What should you do when you see a pedestrian with a white cane?", 
      ["Proceed normally", "Always yield the right of way", "Honk your horn", "Speed up"], 
      1, "A white cane indicates a visually impaired pedestrian. Drivers must always yield the right of way to persons who are visually impaired.")

# More Knowledge Exam Questions
qid += 1
add_q(qid, "What percentage must you score to pass the knowledge exam?", 
      ["70%", "75%", "80%", "90%"], 
      2, "On the actual knowledge examination, you must have 80% or higher correct on each component to pass the exam.")

qid += 1
add_q(qid, "If you fail the knowledge exam, when can you retake it?", 
      ["Immediately", "The next business day", "After one week", "After one month"], 
      1, "If you fail the knowledge exam, you must wait until the next business day to retake it.")

# More Driving Skills Exam Questions
qid += 1
add_q(qid, "If you fail a driving skills exam, how long must you wait before retaking it?", 
      ["1 day", "3 days", "7 days", "30 days"], 
      2, "If you fail a driving skills exam, you must wait seven days before you can retake the exam.")

qid += 1
add_q(qid, "What will cause automatic failure of a driving skills exam?", 
      ["Minor errors", "Disobeying a traffic signal, speeding, or causing an accident", "Going slightly over the line", "Not using turn signal once"], 
      1, "Automatic failures include disobeying traffic signals, speeding, causing an accident, failure to yield right of way, and other serious violations.")

# More License Renewal Questions
qid += 1
add_q(qid, "If your driver's license has been expired for more than 180 days but less than 5 years, what must you do to renew?", 
      ["Just pay the fee", "Pay an administrative penalty, pass a knowledge exam, and pass a vision screening", "Only pass a vision screening", "Only pay a penalty"], 
      1, "If renewing a driver's license expired for at least 180 days but not more than five years, you must pay an administrative penalty, pass a knowledge exam, and pass a vision screening.")

qid += 1
add_q(qid, "If your driver's license has been expired for 5 years or more, what must you do to renew?", 
      ["Just pay the fee", "Pay an administrative penalty, pass a knowledge exam, driving skills exam, and vision screening", "Only pass a knowledge exam", "Only pay a penalty"], 
      1, "If renewing a driver's license expired for five years or more, you must pay an administrative penalty, pass a knowledge exam, a driving skills exam, and a vision screening.")

# More Suspension Questions
qid += 1
add_q(qid, "What is a Habitual Traffic Violator (HTV)?", 
      ["Someone with 5 points", "Someone who accumulates certain traffic offenses within a 10-year period", "Someone with one ticket", "Someone who drives fast"], 
      1, "An HTV is a person who has repeatedly committed traffic offenses over a 10-year period, meeting specific criteria outlined in Indiana law.")

qid += 1
add_q(qid, "What happens if you drive while your license is suspended?", 
      ["Warning only", "It is a serious traffic violation that can result in misdemeanor or felony conviction", "Small fine", "No penalty"], 
      1, "Driving while suspended is a serious traffic violation. Driving while suspended with a prior offense can result in a misdemeanor or felony conviction.")

# More Insurance Questions
qid += 1
add_q(qid, "What is an SR22?", 
      ["A type of insurance", "Proof of future financial responsibility that cannot be canceled without notice to BMV", "A driver's license", "A registration form"], 
      1, "An SR22 form demonstrates that you have motor vehicle insurance that meets state minimum standards, and it cannot be canceled without prior notice given to the BMV.")

qid += 1
add_q(qid, "How long must you maintain SR22 for indefinite no-insurance suspensions that became effective on or after 12/31/2021?", 
      ["30 days", "90 days", "180 days", "1 year"], 
      2, "Indefinite no-insurance suspensions can be stayed upon receipt of SR22 and terminated by maintaining SR22 continuously for 180 days.")

# More Vehicle Equipment Questions
qid += 1
add_q(qid, "What is the minimum tread depth for safe tires?", 
      ["1/32 inch", "1/16 inch", "1/8 inch", "1/4 inch"], 
      1, "If your tread gets below approximately 1/16 of an inch, your car's ability to grip the road in adverse conditions is greatly reduced.")

qid += 1
add_q(qid, "How often should you check your tire pressure?", 
      ["Once a year", "Once a month or before a long trip", "Never", "Only when tires look flat"], 
      1, "Tires have been known to lose up to 1 psi every month, so check all tires, including your spare, once a month or before a long trip.")

# More Work Zone Questions
qid += 1
add_q(qid, "What should you do when you see a 'Flagger Ahead' sign?", 
      ["Speed up", "Be prepared to stop when directed by a flagger", "Ignore it", "Change lanes immediately"], 
      1, "A 'Flagger Ahead' sign warns drivers that a flagger is ahead who will control traffic flow. You must stop when a flagger directs you to stop.")

qid += 1
add_q(qid, "What should you do in a work zone?", 
      ["Speed up to get through quickly", "Stay alert, look for reduced speed limits, narrow lanes, and highway workers", "Ignore signs", "Drive in closed lanes"], 
      1, "In work zones, stay alert, look for reduced speed limits, narrow driving lanes, and highway workers. Pay attention to work zone signs.")

# More Carbon Monoxide Questions
qid += 1
add_q(qid, "What are symptoms of carbon monoxide poisoning?", 
      ["Only headache", "Drowsiness, dizziness, bluish tinge to skin or lips, headache, increased sensitivity to light", "Only nausea", "Only fatigue"], 
      1, "Symptoms of carbon monoxide poisoning can include drowsiness or dizziness, a bluish tinge to your skin or lips, a headache, and increased sensitivity to light.")

qid += 1
add_q(qid, "How can you avoid carbon monoxide poisoning?", 
      ["Never check your exhaust system", "Have your vehicle's exhaust system checked regularly, never run engine in closed garage", "Always run engine in garage", "Ignore unusual sounds"], 
      1, "To avoid carbon monoxide poisoning, have your vehicle's exhaust system checked regularly, never let your engine run in a closed garage, and be alert for unusual sounds.")

# More Traffic Stop Questions
qid += 1
add_q(qid, "What should you do when stopped by law enforcement?", 
      ["Exit your vehicle immediately", "Remain inside your vehicle unless directed otherwise, keep hands visible", "Drive away", "Argue with the officer"], 
      1, "During a traffic stop, remain inside your vehicle unless otherwise directed by the officer. Keep your hands visible, preferably on the steering wheel.")

qid += 1
add_q(qid, "What should you do to acknowledge a law enforcement officer's presence?", 
      ["Ignore them", "Turn on your right turn signal to acknowledge their presence", "Speed up", "Change lanes"], 
      1, "Acknowledge the officer's presence by turning on your right turn signal. This lets the officer know you recognize their presence.")

# ===== MASSIVE BATCH TO REACH ~500 QUESTIONS =====

# Additional Sign Questions (from manual)
sign_questions = [
    ("What does a 'Narrow Bridge' sign warn about?", ["Wide bridge ahead", "Narrow bridge ahead - use caution", "Bridge closed", "Speed limit"], 1),
    ("What does a 'Cattle' sign indicate?", ["Cattle crossing area", "Cattle farm", "No cattle", "Cattle sale"], 0),
    ("What does a 'Farm Machinery' sign warn about?", ["Farm equipment may be on the road", "Farm ahead", "No farming", "Farm sale"], 0),
    ("What does a 'Low Clearance' sign indicate?", ["High clearance ahead", "Low clearance ahead - check vehicle height", "No clearance", "Clearance sale"], 1),
    ("What does a 'Steep Downgrade' sign warn about?", ["Uphill ahead", "Steep downhill grade ahead", "Level road", "Construction"], 1),
    ("What does a 'Winding Road' sign indicate?", ["Straight road", "Winding road ahead", "Road closed", "One way"], 1),
    ("What does a 'Divided Highway Begins' sign mean?", ["Highway ends", "Divided highway begins ahead", "Merge ahead", "Stop ahead"], 1),
    ("What does a 'Two-Way Traffic' sign indicate?", ["One-way traffic", "Two-way traffic ahead", "No traffic", "Heavy traffic"], 1),
    ("What does a 'Side Road' sign warn about?", ["Main road ahead", "Side road entering from right or left", "No side roads", "Road closed"], 1),
    ("What does a 'T-Intersection' sign indicate?", ["Straight road", "T-intersection ahead", "Roundabout", "No intersection"], 1),
    ("What does a 'Curve Ahead' sign warn about?", ["Straight road", "Curve in the road ahead", "Sharp turn", "Road closed"], 1),
    ("What does a 'Sharp Turn' sign indicate?", ["Gentle curve", "Sharp turn ahead", "Straight road", "U-turn"], 1),
    ("What does a 'Lane Ends' sign mean?", ["New lane begins", "Lane ends ahead - merge", "All lanes closed", "Speed up"], 1),
    ("What does a 'Merging Traffic' sign indicate?", ["Traffic separating", "Traffic merging from the right", "No merging", "Stop sign"], 1),
    ("What does a 'Lanes Shifting' sign mean?", ["Lanes straight", "Lanes shifting ahead", "No lanes", "Construction"], 1),
    ("What does a 'Low Shoulder' sign warn about?", ["High shoulder", "Low shoulder - drive carefully", "No shoulder", "Shoulder closed"], 1),
    ("What does a 'Fire Station' sign indicate?", ["Fire ahead", "Fire station nearby - watch for fire trucks", "No fires", "Fire sale"], 1),
    ("What does a 'Playground Warning' sign mean?", ["Playground ahead", "Children may be playing nearby", "No playground", "Playground closed"], 1),
    ("What does a 'Watch For Ice On Bridges' sign warn about?", ["Bridges are always icy", "Bridges may be icy even when road is not", "No ice", "Bridge closed"], 1),
    ("What does a 'Prepare To Stop' sign indicate?", ["Stop immediately", "Be prepared to stop ahead", "No stopping", "Speed up"], 1),
]

for q_text, opts, correct in sign_questions:
    qid += 1
    add_q(qid, q_text, opts, correct, f"This sign warns drivers of upcoming road conditions or hazards.")

# More Regulation Sign Questions
regulation_signs = [
    ("What does a 'No Left Turn' sign mean?", ["Left turns allowed", "Left turns prohibited", "Left turns only at night", "Left turns with signal"], 1),
    ("What does a 'No Right Turn' sign mean?", ["Right turns allowed", "Right turns prohibited", "Right turns only at night", "Right turns with signal"], 1),
    ("What does a 'No Trucks' sign indicate?", ["Trucks allowed", "Trucks prohibited", "Trucks only", "Trucks at night"], 1),
    ("What does a 'Minimum Speed' sign indicate?", ["Maximum speed", "Minimum speed required", "No speed limit", "Speed limit ahead"], 1),
    ("What does a 'Keep Right' sign mean?", ["Keep left", "Keep to the right", "No direction", "Turn right"], 1),
    ("What does a 'Slower Traffic Keep Right' sign mean?", ["Faster traffic keep right", "Slower vehicles should use right lane", "No slow traffic", "Speed up"], 1),
    ("What does a 'Left Lane Must Turn Left' sign mean?", ["Left lane goes straight", "Left lane must turn left", "Left lane closed", "All lanes turn left"], 1),
    ("What does a 'Right Lane Must Turn Right' sign mean?", ["Right lane goes straight", "Right lane must turn right", "Right lane closed", "All lanes turn right"], 1),
    ("What does a 'No Parking' sign mean?", ["Parking allowed", "Parking prohibited", "Parking at night", "Parking with permit"], 1),
    ("What does a 'No Parking Any Time' sign indicate?", ["Parking allowed sometimes", "Parking prohibited at all times", "Parking at night", "Parking with permit"], 1),
    ("What does a 'Reserved Parking' sign mean?", ["General parking", "Parking reserved for specific use", "No parking", "Parking for all"], 1),
    ("What does a 'Tow-Away Zone' sign indicate?", ["Parking allowed", "Vehicles may be towed if parked", "No towing", "Towing service"], 1),
    ("What does a 'Do Not Block Intersection' sign mean?", ["Blocking allowed", "Do not block the intersection", "Intersection closed", "No intersection"], 1),
    ("What does a 'Emergency Stopping Only' sign mean?", ["Regular parking allowed", "Only emergency stopping allowed", "No stopping", "All stopping allowed"], 1),
    ("What does a 'Left on Green Arrow Only' sign mean?", ["Left turn on any green", "Left turn only when green arrow is displayed", "No left turns", "Left turn anytime"], 1),
    ("What does a 'Left Turn Yield on Green' sign mean?", ["No yielding needed", "Yield to oncoming traffic when turning left on green", "Stop on green", "Speed up"], 1),
    ("What does a 'Multiple Turns' sign indicate?", ["Single turn", "Multiple turns ahead", "No turns", "U-turn only"], 1),
    ("What does a 'Turn Left or Go Through' sign mean?", ["Only turn left", "You may turn left or go straight", "Only go straight", "No options"], 1),
    ("What does a 'Turn Right or Go Through' sign mean?", ["Only turn right", "You may turn right or go straight", "Only go straight", "No options"], 1),
    ("What does a 'Two-Way Left Turn' sign indicate?", ["One-way left turn", "Center lane for left turns from both directions", "No left turns", "Left turn only"], 1),
]

for q_text, opts, correct in regulation_signs:
    qid += 1
    add_q(qid, q_text, opts, correct, f"This sign regulates traffic movement and parking.")

# More Scenario-Based Questions
scenarios = [
    ("You're driving and see a school bus with amber lights flashing. What should you do?", ["Speed up", "Slow down and prepare to stop", "Continue at same speed", "Change lanes"], 1),
    ("You're approaching a railroad crossing and the gates are down. What should you do?", ["Drive around the gate", "Stop and wait for the train to pass", "Speed up to beat the train", "Honk your horn"], 1),
    ("You're driving in heavy rain and your vehicle starts to hydroplane. What should you do?", ["Speed up", "Ease off the gas pedal and steer straight", "Brake hard", "Turn sharply"], 1),
    ("You're following a large truck and cannot see the driver's mirrors. What should you do?", ["You're following at a safe distance", "You're following too closely - increase distance", "Speed up to pass", "Honk your horn"], 1),
    ("You're driving at night and an oncoming vehicle has its high beams on. What should you do?", ["Flash your high beams back", "Look toward the right side of the road", "Look directly at the lights", "Speed up"], 1),
    ("You're making a left turn and an oncoming vehicle is also turning left. What should you do?", ["Turn in front of them", "Turn behind them, keeping to the right of the center line", "Stop and wait", "Speed up"], 1),
    ("You're driving and your brakes fail. What should you do first?", ["Panic and stop immediately", "Shift to a lower gear and pump the brake pedal", "Turn off the engine", "Use only the parking brake"], 1),
    ("You're driving and see a pedestrian with a white cane at a crosswalk. What should you do?", ["Proceed if no traffic", "Always yield the right of way", "Honk your horn", "Speed up"], 1),
    ("You're driving in fog and visibility is very poor. What should you do?", ["Use high beam headlights", "Use low beam headlights, slow down, and if visibility is near zero, pull off the road", "Speed up to get through", "Turn off headlights"], 1),
    ("You're driving and see a disabled vehicle on the shoulder with hazard lights on. What should you do?", ["Stop to help", "Change lanes away from the vehicle if possible, or slow down", "Speed up", "Ignore it"], 1),
    ("You're driving and your tire blows out. What should you do?", ["Brake immediately", "Hold the steering wheel firmly, keep going straight, and slow down gradually", "Turn sharply", "Speed up"], 1),
    ("You're driving and see a work zone ahead. What should you do?", ["Speed up to get through", "Stay alert, look for reduced speed limits and workers, and slow down", "Ignore signs", "Change lanes frequently"], 1),
    ("You're driving and see a flagger with a 'STOP' paddle. What should you do?", ["Slow down", "Stop", "Speed up", "Ignore it"], 1),
    ("You're driving and see a yellow flashing arrow for a turning movement. What should you do?", ["Proceed without yielding", "Proceed with the turn only after yielding to pedestrians and oncoming traffic", "Stop", "Speed up"], 1),
    ("You're driving and see a pedestrian hybrid beacon that is dark. What should you do?", ["Stop", "Proceed normally - it's not activated", "Slow down", "Yield"], 1),
    ("You're driving and see a pedestrian hybrid beacon with two steady red lights. What should you do?", ["Proceed if clear", "Stop - pedestrian is crossing", "Slow down", "Yield"], 1),
    ("You're driving and your vehicle starts to skid. What should you do?", ["Turn sharply away from the skid", "Ease off the gas and steer in the direction the rear is sliding", "Brake hard", "Speed up"], 1),
    ("You're driving and see a 'School Bus Stop Ahead' sign. What should you do?", ["Speed up", "Be alert for a school bus that may be loading or unloading children", "Ignore it", "Change lanes"], 1),
    ("You're driving and see a slow-moving vehicle emblem. What should you do?", ["Speed up", "Be prepared for a vehicle traveling 25 mph or less", "Ignore it", "Honk your horn"], 1),
    ("You're driving and see a 'Road Work Ahead' sign. What should you do?", ["Speed up", "Be prepared for construction ahead", "Ignore it", "Change lanes"], 1),
]

for q_text, opts, correct in scenarios:
    qid += 1
    add_q(qid, q_text, opts, correct, f"This scenario tests your knowledge of safe driving practices.")

# More Specific Rule Questions
specific_rules = [
    ("How many hours of supervised driving practice must an 18+ year old complete before applying for a driver's license?", ["25 hours", "50 hours", "75 hours", "100 hours"], 1),
    ("Of the required supervised driving hours for 18+ year olds, how many must be completed at night?", ["5 hours", "10 hours", "15 hours", "20 hours"], 1),
    ("What is the maximum width of a vehicle that may be operated without a special permit?", ["7 feet", "8 feet, 6 inches", "10 feet", "12 feet"], 1),
    ("What is the maximum height of a vehicle that may be operated without a special permit?", ["11 feet", "12 feet, 6 inches", "13 feet, 6 inches", "14 feet"], 2),
    ("What is the maximum weight of a vehicle that may be operated without a special permit?", ["60,000 lbs", "70,000 lbs", "80,000 lbs", "90,000 lbs"], 2),
    ("How far must you stop from a stop sign if there is no stop line or crosswalk?", ["At the sign", "Before entering the intersection", "After the sign", "It doesn't matter"], 1),
    ("How far must you stop from a railroad crossing if required to stop?", ["5-15 feet", "15-50 feet", "50-100 feet", "100-200 feet"], 1),
    ("How far from an intersection, railroad crossing, bridge, or tunnel is passing prohibited?", ["50 feet", "75 feet", "100 feet", "150 feet"], 2),
    ("How far before turning or changing lanes should you signal?", ["25 feet", "50 feet", "75 feet", "100 feet"], 3),
    ("What is the speed limit in alleys?", ["10 mph", "15 mph", "20 mph", "25 mph"], 1),
    ("What is the speed limit on non-divided state highways in urban areas?", ["45 mph", "50 mph", "55 mph", "60 mph"], 2),
    ("What is the speed limit on county roads?", ["45 mph", "50 mph", "55 mph", "60 mph"], 2),
    ("How long is a motorcycle learner's permit valid?", ["6 months", "1 year", "18 months", "2 years"], 1),
    ("How many times may a motorcycle learner's permit be renewed?", ["Never", "Once", "Twice", "Unlimited"], 1),
    ("What is the minimum age to operate a Motor Driven Cycle (MDC)?", ["14 years", "15 years", "16 years", "17 years"], 1),
    ("What is the maximum speed an MDC may be operated?", ["25 mph", "30 mph", "35 mph", "40 mph"], 2),
    ("May an MDC be operated on an interstate highway?", ["Yes", "No", "Only during day", "Only with permit"], 1),
    ("What is the minimum age to apply for a for-hire endorsement?", ["16 years", "17 years", "18 years", "21 years"], 2),
    ("How long must you hold a driver's license before applying for a for-hire endorsement?", ["6 months", "1 year", "18 months", "2 years"], 1),
    ("What is the validity period of a CDL?", ["2 years", "3 years", "4 years", "6 years"], 2),
    ("What is the minimum age to apply for a CDL?", ["16 years", "18 years", "21 years", "25 years"], 1),
    ("What is the minimum age to apply for a CDL with passenger or school bus endorsements?", ["18 years", "21 years", "25 years", "No minimum"], 1),
    ("How long is an identification card valid?", ["3 years", "4 years", "6 years", "8 years"], 2),
    ("How long is a driver's license valid for someone 75-84 years of age?", ["2 years", "3 years", "4 years", "6 years"], 1),
    ("How long is a driver's license valid for someone 85 years or older?", ["1 year", "2 years", "3 years", "4 years"], 1),
    ("How long before a credential expires may it be renewed (for U.S. citizens)?", ["6 months", "12 months", "24 months", "36 months"], 2),
    ("How long before a learner's permit expires may it be renewed?", ["7 days", "14 days", "30 days", "60 days"], 2),
    ("If a learner's permit has been expired for more than 180 days, what must you do?", ["Just renew it", "Retake the knowledge exam", "Retake both knowledge and skills exams", "Start over"], 1),
    ("What is the reinstatement fee for a first no-insurance suspension (after Jan 1, 2015)?", ["$150", "$250", "$500", "$1000"], 1),
    ("What is the reinstatement fee for a second no-insurance suspension (after Jan 1, 2015)?", ["$250", "$500", "$750", "$1000"], 1),
    ("What is the reinstatement fee for a third no-insurance suspension (after Jan 1, 2015)?", ["$500", "$750", "$1000", "$1500"], 2),
    ("How long is the suspension period for failing to appear in court or pay traffic offenses?", ["30 days", "Until you appear or pay", "90 days", "1 year"], 1),
    ("What is the suspension period for a first OWI (Operating While Intoxicated) conviction?", ["30 days", "90 days", "180 days", "1 year"], 2),
    ("What is the suspension period for refusing a chemical test (first offense)?", ["90 days", "180 days", "1 year", "2 years"], 2),
    ("What is the suspension period for refusing a chemical test (with prior OWI)?", ["1 year", "2 years", "3 years", "5 years"], 1),
    ("How long is an HTV suspension under Section A (two major offenses resulting in injury or death)?", ["5 years", "10 years", "Life", "Depends on offenses"], 1),
    ("How long is an HTV suspension under Section B (three major offenses)?", ["5 years", "10 years", "Life", "Depends on offenses"], 1),
    ("How long is an HTV suspension under Section C (10 traffic offenses in 10 years)?", ["3 years", "5 years", "10 years", "Life"], 1),
    ("What is the point credit for completing a Driver Safety Program?", ["2 points", "3 points", "4 points", "5 points"], 2),
    ("How often may you receive a point credit from a Driver Safety Program?", ["Once per year", "Once every two years", "Once every three years", "Unlimited"], 2),
    ("Within how many days must you complete a required Driver Safety Program?", ["30 days", "60 days", "90 days", "120 days"], 2),
]

for q_text, opts, correct in specific_rules:
    qid += 1
    add_q(qid, q_text, opts, correct, f"This question tests your knowledge of specific Indiana driving laws and regulations.")

# ===== FINAL BATCH TO REACH ~500 QUESTIONS =====

# More questions from sample exam section and additional topics
final_batch = [
    # Sample Exam Questions from Manual
    ("The shape of a circular traffic sign indicates:", ["Information", "Stop", "Warning", "Railroad crossing"], 3),
    ("The shape of an equilateral triangle traffic sign indicates:", ["Curve ahead", "Railroad crossing", "Yield right of way", "School zone"], 2),
    ("The shape of a pennant-shaped traffic sign indicates:", ["No passing zone", "School zone", "Wait for signal", "Yield"], 0),
    ("A 'Pedestrian Crossing' sign indicates:", ["Children at play", "Flagger ahead", "Pedestrian crossing", "School zone"], 2),
    ("A 'Lane Ends' sign indicates:", ["Detour ahead", "Divided highway", "Merging traffic", "Lane ends"], 3),
    ("The shape of a diamond-shaped sign indicates:", ["Detour", "Railroad crossing", "Road work ahead", "Warning"], 3),
    
    # More Parking and Stopping Questions
    ("Is parking allowed beside another parked vehicle (double parking)?", ["Yes", "No, it is prohibited", "Only at night", "Only with permit"], 1),
    ("Is parking allowed on pedestrian crosswalks?", ["Yes", "No, it is prohibited", "Only at night", "Only with permit"], 1),
    ("Is parking allowed in fire lanes?", ["Yes", "No, it is prohibited", "Only at night", "Only with permit"], 1),
    ("Is parking allowed adjacent to yellow curbs?", ["Yes", "No, it is prohibited", "Only at night", "Only with permit"], 1),
    ("Is parking allowed in tunnels?", ["Yes", "No, it is prohibited", "Only at night", "Only with permit"], 1),
    
    # More Right of Way Questions
    ("At a four-way stop, if two vehicles arrive at the same time, who goes first?", ["The vehicle on the left", "The vehicle on the right", "The larger vehicle", "Both proceed together"], 1),
    ("When entering a street from an alley or driveway, who has the right of way?", ["You always have right of way", "You must yield to traffic on the street", "Traffic on the street must yield", "Whoever is faster"], 1),
    ("When turning left at an intersection, you must yield to:", ["Only oncoming traffic", "Oncoming traffic and pedestrians", "Only pedestrians", "No one"], 1),
    ("When turning right, you must yield to:", ["Oncoming traffic", "Pedestrians", "Both pedestrians and oncoming traffic if turning across their path", "No one"], 2),
    
    # More Following Distance and Speed Questions
    ("At 55 mph, how many feet does a vehicle travel in one second?", ["About 51 feet", "About 81 feet", "About 103 feet", "About 120 feet"], 1),
    ("At 70 mph, how many feet does a vehicle travel in one second?", ["About 51 feet", "About 81 feet", "About 103 feet", "About 120 feet"], 2),
    ("How many seconds does it take to travel a football field at 55 mph?", ["2.9 seconds", "3.7 seconds", "5.8 seconds", "7.2 seconds"], 1),
    ("How many seconds does it take to travel a football field at 70 mph?", ["2.9 seconds", "3.7 seconds", "5.8 seconds", "7.2 seconds"], 0),
    
    # More Weather and Road Condition Questions
    ("What should you do when driving on wet roads after a rainfall?", ["Speed up", "Slow down - roads are most slippery immediately after rainfall", "Continue at normal speed", "Use high beams"], 1),
    ("What should you do after driving through water puddles?", ["Continue normally", "Test your brakes by pumping them", "Speed up", "Stop immediately"], 1),
    ("When is moisture on ramps, bridges, and overpasses most likely to freeze?", ["Never", "Before other sections of roadway", "After other sections", "At the same time"], 1),
    ("What should you do when driving in high winds?", ["Speed up", "Be aware of conditions, especially if driving a high-profile vehicle", "Ignore it", "Stop"], 1),
    ("What should you do if caught in flash flooding?", ["Drive through the water", "Do not drive around barricades or where water is over the road", "Speed up", "Drive in the center"], 1),
    
    # More Vehicle Operation Questions
    ("What should you do if your vehicle leaves the roadway?", ["Turn back onto pavement immediately", "Ease up on gas, then gradually turn back when safe", "Brake hard", "Speed up"], 1),
    ("What should you do if a collision looks possible?", ["Turn away from oncoming traffic, even if it means leaving the road", "Speed up", "Brake hard and stop", "Close your eyes"], 0),
    ("What is safer: hitting something moving in the same direction or something head-on?", ["Head-on", "Something moving in the same direction", "Both are equally safe", "Neither"], 1),
    ("What should you do if your vehicle's wheels drift onto the shoulder?", ["Turn back onto pavement immediately", "Drive along shoulder, ease up on gas, then turn back gradually", "Brake hard", "Speed up"], 1),
    
    # More Emergency Vehicle Questions
    ("What must you do when approaching an authorized parked vehicle with amber flashing lights?", ["Ignore it", "Change lanes away if possible, or slow to 10 mph under posted limit", "Speed up", "Stop"], 1),
    ("What types of vehicles have amber flashing lights that require you to move over?", ["Only police", "Recovery vehicles, highway maintenance, utility service, solid waste haulers, survey/construction", "Only ambulances", "Only fire trucks"], 1),
    ("What must you do when approaching a disabled vehicle with flashing hazard lights?", ["Ignore it", "Change lanes away if possible, or slow to 10 mph under posted limit", "Speed up", "Stop to help"], 1),
    
    # More Bicycle and Pedestrian Questions
    ("May a bicyclist ride in a travel lane instead of a bike lane?", ["No, must use bike lane", "Yes, bicyclist has right to use either bike lane or travel lane", "Only at night", "Only with permit"], 1),
    ("What should you do when turning left and a bicyclist is entering from the opposite direction?", ["Turn in front of them", "Wait for bicyclist to pass before making the turn", "Speed up", "Honk your horn"], 1),
    ("What should you do when turning right and a bicyclist is approaching on the right?", ["Turn in front of them", "Let the cyclist go through the intersection first", "Speed up", "Honk your horn"], 1),
    ("What should you do if children are in the vicinity while driving?", ["Proceed normally", "Take special care - children may cross at unexpected places", "Speed up", "Ignore them"], 1),
    ("What should you do when you see elderly persons or someone with a visual disability crossing?", ["Proceed if they're moving slowly", "Be respectful and yield", "Honk your horn", "Speed up"], 1),
    
    # More License and Credential Questions
    ("What format do credentials have for Indiana residents under 21 years of age?", ["Horizontal", "Vertical", "Square", "Circular"], 1),
    ("What appears on credentials for those under 21?", ["Nothing special", "Dates the cardholder turns 18 and 21", "Only birth date", "Only expiration"], 1),
    ("How long do you have to notify BMV of an address change?", ["10 days", "30 days", "60 days", "90 days"], 1),
    ("How long do you have to amend your credential after a name change?", ["10 days", "30 days", "60 days", "90 days"], 1),
    ("What must you do before amending your credential for a name change?", ["Nothing", "Visit Social Security Administration first, then wait one business day", "Just visit BMV", "Get a court order"], 1),
    
    # More Learner's Permit Questions
    ("Who may practice driving with a learner's permit holder under 16 enrolled in driver education?", ["Anyone 21 or older", "Licensed driver training instructor, certified driver rehabilitation specialist, or licensed driver 25+ related by blood/marriage", "Only parents", "Only instructors"], 1),
    ("Who may practice driving with a learner's permit holder under 18 not enrolled in driver education?", ["Anyone 21 or older", "Licensed driver 25+ related by blood/marriage, spouse 21+, or licensed instructor", "Only parents", "Only instructors"], 1),
    ("Who may practice driving with a learner's permit holder 18 or older?", ["Anyone 21 or older", "Licensed driver 25+ or spouse 21+", "Only parents", "Anyone"], 1),
    ("Where must the supervising driver be seated?", ["Anywhere in vehicle", "Front passenger seat", "Back seat", "Driver's seat"], 1),
    
    # More Probationary License Questions
    ("After 180 days of holding a probationary license and being under 18, when may you not drive?", ["10 p.m. to 5 a.m. Sunday-Thursday, 1 a.m. to 5 a.m. Friday-Saturday", "11 p.m. to 5 a.m. Sunday-Thursday, 1 a.m. to 5 a.m. Friday-Saturday", "Midnight to 5 a.m.", "9 p.m. to 6 a.m."], 1),
    ("May you drive during restricted hours for work or school activities?", ["No", "Yes, if going to/from lawful employment, school-sanctioned activity, or religious event", "Only for work", "Only for school"], 1),
    ("May probationary license holders use telecommunications devices while driving?", ["Yes, always", "No, prohibited except for 911 emergency calls", "Only hands-free", "Only at stop lights"], 1),
    
    # More Knowledge and Skills Exam Questions
    ("How early must you arrive at a branch to take the computer-based knowledge exam?", ["15 minutes", "30 minutes", "45 minutes", "1 hour"], 1),
    ("What must you provide for a driving skills exam?", ["Nothing", "Your own legally equipped, insured, and safe vehicle with current registration", "BMV provides vehicle", "Any vehicle"], 1),
    ("What happens if you fail a third driving skills exam while holding a learner's permit?", ["Can retake immediately", "Must wait 2 months from date of last failed exam", "Must wait 1 month", "Must start over"], 1),
    ("What is evaluated during a driving skills exam?", ["Only parking", "Driving in proper lane, following distance, speed control, defensive driving, intersection approach, reversing", "Only reversing", "Only lane changes"], 1),
    
    # More Vehicle Equipment Questions
    ("What lighting is required for trucks and buses?", ["One tail lamp", "Two red tail lamps, one rear white license plate lamp, and at least one red stop-lamp", "Only headlights", "No special requirements"], 1),
    ("What must be displayed on loads extending more than 4 feet beyond the rear of a vehicle?", ["Nothing", "Red lamp at night and red flag during day at extreme rear end", "Only a flag", "Only a lamp"], 1),
    ("What warning devices must a disabled truck, bus, or tractor-trailer display?", ["One flare", "Three bi-directional emergency reflective triangles, or at least six fuses, or three liquid-burning flares", "Only hazard lights", "Nothing"], 1),
    ("How far behind a disabled vehicle should warning devices be placed on a divided highway?", ["50 feet", "100 feet", "200 feet", "500 feet"], 2),
    ("How far behind a disabled vehicle should warning devices be placed if within 500 feet of a curve or hill?", ["100 feet", "200 feet", "500 feet", "1000 feet"], 2),
    
    # More Specific Law Questions
    ("What is the penalty for disregarding a school bus stop arm?", ["Traffic ticket", "Class A misdemeanor, or Level 6 felony if injury, or Level 5 felony if death", "Warning only", "Small fine"], 1),
    ("What happens if a juvenile is expelled or suspended from school?", ["Nothing", "BMV may suspend driving privileges", "Warning only", "Fine"], 1),
    ("What happens if a juvenile is a habitual truant?", ["Nothing", "BMV may suspend driving privileges", "Warning only", "Fine"], 1),
    ("What happens if a juvenile withdraws from school?", ["Nothing", "BMV may suspend driving privileges", "Warning only", "Fine"], 1),
    
    # More Insurance and Financial Responsibility Questions
    ("What is a Certificate of Compliance (COC)?", ["Driver's license", "Proof of financial responsibility from insurance provider", "Registration", "Title"], 1),
    ("Within how many days must a COC be received by BMV after a request?", ["30 days", "60 days", "90 days", "120 days"], 2),
    ("What happens if you don't provide proof of financial responsibility within 90 days?", ["Warning", "Driving privileges suspended", "Fine only", "Nothing"], 1),
    ("What is required to reinstate after a no-insurance suspension?", ["Just pay fee", "Pay reinstatement fee and/or maintain SR22 for 180 days", "Only SR22", "Nothing"], 1),
    
    # More Organ Donation and Indicators Questions
    ("What indicates organ donation on a credential?", ["Star", "Small heart", "Letter O", "Nothing"], 1),
    ("At what age may individuals declare organ donation without family override?", ["16 years", "18 years", "21 years", "Any age"], 1),
    ("What indicator may be placed on credentials for active-duty military?", ["Star", "Heart", "Active-duty military indicator", "Flag"], 2),
    ("What indicator may be placed on credentials for veterans?", ["Star", "Heart", "Veteran indicator", "Flag"], 2),
    ("What document is needed for a veteran indicator?", ["Driver's license", "DD 214", "Birth certificate", "Social Security card"], 1),
    
    # More Watercraft Questions
    ("What is required to operate a watercraft with engine over 10 horsepower?", ["Nothing", "Valid driver's license, or if 15+ without license, approved boater education course", "Only boater education", "Only driver's license"], 1),
    ("What must you have while operating a watercraft if you don't have a driver's license?", ["Nothing", "Valid Indiana identification card", "Birth certificate", "Social Security card"], 1),
    ("May you operate a watercraft if your driver's license is suspended?", ["Yes", "No", "Only on private water", "Only with permit"], 1),
    ("What is the minimum age to operate a watercraft with engine over 10 horsepower?", ["12 years", "14 years", "15 years", "16 years"], 2),
    
    # More Parking Placard Questions
    ("How long is a permanent parking placard valid?", ["1 year", "Does not expire unless disability no longer permanent", "5 years", "10 years"], 1),
    ("Is there a fee for a permanent parking placard?", ["Yes", "No fee", "Small fee", "Depends"], 1),
    ("How long is a temporary parking placard valid?", ["30 days", "Until date indicated by health care provider or one year, whichever is first", "6 months", "1 year"], 1),
    ("Is there a fee for a temporary parking placard?", ["No", "Yes, there is a fee", "Depends", "Free for first one"], 1),
    ("Is parking allowed in the diagonally striped area next to accessible parking?", ["Yes, with placard", "No, prohibited at all times even with valid placard", "Only at night", "Only with permit"], 1),
    
    # More Specific Scenario Questions
    ("You're driving and see a vehicle with a slow-moving vehicle emblem. What is the maximum speed of that vehicle?", ["15 mph", "20 mph", "25 mph", "30 mph"], 2),
    ("You're driving and see a pedestrian hybrid beacon with alternating flashing red lights. What should you do?", ["Stop", "Proceed if crossing is clear of pedestrians", "Slow down", "Yield"], 1),
    ("You're driving a motorcycle and get stuck at a red light that won't change. What may you do?", ["Wait indefinitely", "After stopping for 2 minutes, proceed with due caution", "Run the red light", "Turn around"], 1),
    ("You're driving an MDC and get stuck at a red light. What may you do?", ["Same as motorcycle", "May not proceed through red light", "Wait 1 minute then go", "Turn around"], 1),
    ("You're driving and see a bicycle signal displaying red. What should you do?", ["Proceed", "Stop", "Yield", "Slow down"], 1),
    ("You're driving and see a bus or transit signal. Does it apply to you?", ["Yes, always", "No, only applies to bus or transit operators", "Sometimes", "Depends"], 1),
    
    # More Roundabout Questions
    ("In a multi-lane roundabout, should you change lanes in the circular roadway?", ["Yes, always", "No, drivers should not change lanes in the circulatory roadway", "Only to exit", "Only if needed"], 1),
    ("In a multi-lane roundabout, who must yield to large vehicles?", ["Large vehicles yield to small", "Small vehicles must yield to large vehicles", "No one yields", "Depends on size"], 1),
    ("In a multi-lane roundabout with two large trucks, who yields?", ["Truck on left", "Truck in right lane must yield to truck in left lane", "Neither yields", "Both yield"], 1),
    
    # More U-Turn and Turning Questions
    ("What is a median U-turn or J-turn intersection?", ["Regular intersection", "Intersection where left turn is prohibited in intersection, made after proceeding through", "Roundabout", "No-turn intersection"], 1),
    ("When making a U-turn, what must you always do?", ["Speed up", "Always yield right of way to oncoming vehicles and pedestrians", "Honk your horn", "Use emergency flashers"], 1),
    ("What is the safest type of turn signal?", ["Hand signals", "Lighted signals", "Both are equal", "Horn"], 1),
    
    # More Skidding and Vehicle Control Questions
    ("If your vehicle has anti-lock brakes (ABS) and begins to skid, what should you do?", ["Pump the brakes", "Keep foot on brake pedal with firm continuous pressure, steer normally", "Turn off engine", "Use parking brake"], 1),
    ("What indicates your ABS is working?", ["Nothing", "Mechanical sound or noise and vibration or increased resistance in brake pedal", "Squealing", "Smoke"], 1),
    ("What can cause a vehicle to roll over?", ["Only high speed", "Panicked steering, improper maneuvering, improperly inflated tires, improper loading, rural roads, curves and ramps", "Only curves", "Only speed"], 1),
    
    # More Fuel Economy Questions
    ("At what speed does fuel consumption increase steadily?", ["Above 35 mph", "Above 45 mph", "Above 55 mph", "Above 65 mph"], 1),
    ("How much more fuel is used at 75 mph compared to 55 mph?", ["25% more", "50% more", "75% more", "100% more"], 1),
    ("When is fuel economy worse?", ["When engine is warm", "When engine is cold", "At high speeds", "At low speeds"], 1),
    
    # More Tire Questions
    ("How much air pressure may tires lose per month?", ["0.5 psi", "1 psi", "1.5 psi", "2 psi"], 1),
    ("When should you check tire pressure?", ["When tires look flat", "Cold - before driving or at least 3 hours after driving", "After driving", "Once a year"], 1),
    ("What should you compare tire pressure to?", ["Pressure on tire sidewall", "Recommended psi on sticker inside driver's door or owner's manual", "Other tires", "Nothing"], 1),
    ("What is the penny test used for?", ["Checking tire pressure", "Checking tire tread depth", "Checking tire age", "Checking tire size"], 1),
    
    # More Drowsy Driving Questions
    ("Going how many hours without sleep leaves a driver equally impaired to .08 BAC?", ["12 hours", "16 hours", "18 hours", "24 hours"], 2),
    ("What percentage of fatal crashes involve a fatigued driver?", ["5%", "10%", "17.6%", "25%"], 2),
    ("What age group accounts for 64% of fatigue-related accidents?", ["16-29", "30-45", "46-60", "60+"], 0),
    
    # More Aggressive Driving Questions
    ("What percentage of Indiana traffic fatalities occur due to 'dangerous driving'?", ["10%", "20%", "One-third", "50%"], 2),
    ("How many actions constitute aggressive driving in one episode?", ["One", "Two", "At least three", "Four"], 2),
    
    # More Rural Road Questions
    ("What makes stopping and turning more difficult on gravel roads?", ["Nothing", "Reduced traction", "Increased traction", "Smoother surface"], 1),
    ("What should you do on dirt roads during dry periods?", ["Speed up", "Be aware of dust reducing visibility, use low beam headlights", "Use high beams", "Stop"], 1),
    ("What should you do before approaching the crest of a steep hill?", ["Speed up", "Slow down, move to right, watch for oncoming vehicles", "Stay in center", "Honk horn"], 1),
    ("What may reduce your ability to see vehicles on rural roads?", ["Nothing", "Cultivated crops like corn", "Trees", "Buildings"], 1),
    
    # More Sharing Road Questions
    ("What should you do when sharing the road with a horse or horse-drawn vehicle?", ["Speed up", "Approach with caution, be alert for hand signals", "Honk your horn", "Pass immediately"], 1),
    ("Who has the right of way when a law enforcement officer is directing traffic?", ["Traffic signal", "Traffic sign", "Law enforcement officer's command", "Whoever is faster"], 2),
    ("Do official processions like funerals have right of way?", ["No", "Yes, regardless of traffic signals", "Only with permit", "Depends"], 1),
    
    # More Parallel Parking Questions
    ("How far should you maintain from the vehicle in front when parallel parking?", ["1 foot", "At least 2 feet", "3 feet", "4 feet"], 1),
    ("At what angle should your vehicle be when parallel parking?", ["30 degrees", "45 degrees", "60 degrees", "90 degrees"], 1),
    ("When parking facing uphill with a curb, which way should you turn wheels?", ["Toward curb", "Away from curb", "Straight", "Doesn't matter"], 1),
    ("When parking facing uphill without a curb, which way should you turn wheels?", ["Toward road", "Away from road", "Straight", "Doesn't matter"], 1),
    
    # More Accident Questions
    ("What should you do if an accident involves hazardous materials?", ["Move vehicle immediately", "Do not move vehicle if it involves hazardous materials, injury, death, or entrapment", "Call 911 only", "Leave immediately"], 1),
    ("What should you do if you collide with an unattended vehicle?", ["Leave", "Stop, take reasonable steps to notify owner, or call law enforcement if owner can't be located", "Leave a note", "Nothing"], 1),
    ("What should you do if an accident results in injury or death?", ["Leave immediately", "Provide reasonable assistance as directed by law enforcement or medical personnel", "Only call 911", "Nothing"], 1),
    
    # More Vehicle Theft Prevention Questions
    ("What should you do to reduce vehicle theft?", ["Leave keys in vehicle", "Remove keys, lock doors, don't hide spare keys, park with wheels turned and emergency brake on", "Leave engine running", "Hide keys under car"], 1),
    ("Where should you park to reduce theft risk?", ["Dark areas", "Well-lit, well-patrolled areas", "Alleyways", "Remote areas"], 1),
    
    # More Carbon Monoxide Questions
    ("When is carbon monoxide most likely to leak into a vehicle?", ["Never", "When heater is running, exhaust system faulty, or in heavy traffic", "Only in garages", "Only in traffic"], 1),
    ("Can you see, smell, or taste carbon monoxide?", ["Yes", "No", "Sometimes", "Depends"], 1),
    ("What should you do in congested traffic in cold weather?", ["Open fresh-air vent", "Close fresh-air vent", "Turn off heat", "Roll down windows"], 1),
    
    # More Traffic Stop Questions
    ("Where should you stop when pulled over by law enforcement?", ["Center median", "Right-side shoulder", "Left side", "Anywhere"], 1),
    ("What should you do if there's no safe place to stop immediately?", ["Stop in traffic", "Slow down, turn on hazard lights, find next safe location", "Speed up", "Ignore officer"], 1),
    ("What should you do with your cell phone during a traffic stop?", ["Continue talking", "End conversation and turn off radio", "Make a call", "Text"], 1),
    ("What should passengers do during a traffic stop?", ["Exit vehicle", "Place hands in clear view on their laps", "Hide hands", "Move around"], 1),
    ("What should you do if your windows are tinted?", ["Nothing", "Roll down windows after stopping", "Stay in vehicle", "Exit vehicle"], 1),
    ("Is signing a traffic ticket an admission of guilt?", ["Yes", "No, it's only acknowledgment of receiving the ticket", "Sometimes", "Depends"], 1),
    
    # More Specific Indiana Law Questions
    ("What is the minimum age to apply for an identification card?", ["Any age", "15 years", "16 years", "18 years"], 0),
    ("May you hold more than one credential at the same time?", ["Yes", "No, Indiana residents cannot hold more than one credential", "Only if from different states", "Depends"], 1),
    ("What must you do if BMV discovers you have a credential from another state?", ["Nothing", "Surrender the out-of-state credential", "Keep both", "Choose one"], 1),
    ("How long is an MDC endorsement valid?", ["2 years", "3 years", "4 years", "6 years"], 3),
    ("What is required to operate an autocycle?", ["Motorcycle license", "Valid driver's license", "Special permit", "Nothing"], 1),
    ("What features must an autocycle have?", ["None", "Roll cage, safety belts, anti-lock brakes, steering wheel and pedals", "Only seat belts", "Only steering wheel"], 1),
    
    # More For-Hire Questions
    ("What is the gross weight range for property-for-hire vehicles requiring for-hire endorsement?", ["10,000-20,000 lbs", "16,000-26,000 lbs", "20,000-30,000 lbs", "26,000-36,000 lbs"], 1),
    ("How many passengers may a for-hire vehicle designed to transport have (including driver)?", ["8 or fewer", "Fewer than 16", "16 or more", "Any number"], 1),
    ("Is a medical examination report required for a for-hire endorsement?", ["Yes, always", "No, BMV does not require it", "Only for some vehicles", "Depends on age"], 1),
    
    # More Motorcycle Questions
    ("What must you wear when operating a motorcycle with a learner's permit?", ["Nothing", "Helmet", "Only during day", "Only at night"], 1),
    ("When may you ride a motorcycle with a learner's permit?", ["Anytime", "One-half hour before sunrise to one-half hour after sunset", "Only during day", "Only at night"], 1),
    ("May you carry passengers with a motorcycle learner's permit?", ["Yes", "No", "Only one", "Only during day"], 1),
    ("What is required to obtain a motorcycle endorsement if you're 16 years 90 days or older?", ["Only knowledge exam", "Motorcycle safety course", "Only skills exam", "Nothing"], 1),
    
    # More MDC Questions
    ("What must MDC operators under 18 wear?", ["Nothing", "Helmet and protective glasses, goggles, or face shield", "Only helmet", "Only glasses"], 1),
    ("How must an MDC operator sit?", ["Any way", "In a position astride (legs on each side of) the seat", "Sideways", "Backwards"], 1),
    ("Must MDC headlamps be illuminated while operating?", ["No", "Yes", "Only at night", "Only in bad weather"], 1),
    ("May an MDC carry packages in hand?", ["Yes", "No", "Only small packages", "Only with permit"], 1),
    ("Where must an MDC operate on the roadway?", ["Anywhere", "Near right-hand edge unless passing or preparing for left turn", "Center of lane", "Left side"], 1),
    ("May an MDC carry passengers?", ["Yes", "No", "Only one", "Only during day"], 1),
    ("May an MDC operate on a sidewalk?", ["Yes", "No", "Only to cross", "Only with permit"], 1),
]

for q_text, opts, correct in final_batch:
    qid += 1
    add_q(qid, q_text, opts, correct, f"This question tests comprehensive knowledge of Indiana driving laws and safe practices.")

# More questions to reach ~500 total...
print(f"Current question count: {len(questions)}")
print(f"Target: ~500 questions")
print(f"Still need: {500 - len(questions)} more questions")

# Continue adding more questions to reach ~500...

# Generate TypeScript file
ts_content = """export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer
  explanation?: string;
}

export const bmvQuestions: Question[] = [
"""

for q in questions:
    ts_content += f"""  {{
    id: "{q['id']}",
    question: "{q['question'].replace('"', '\\"')}",
    options: {q['options']},
    correctAnswer: {q['correctAnswer']},
    explanation: "{q['explanation'].replace('"', '\\"') if q['explanation'] else ''}"
  }},
"""

ts_content += "];\n"

print(f"Generated {len(questions)} questions")
print("Writing to file...")

with open('src/data/questions.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Done!")

