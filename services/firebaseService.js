import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const WAYPOINTS_COLLECTION = 'waypoints';

export const firebaseService = {
  // Fetch all waypoints from Firestore
  async getWaypoints() {
    try {
      const waypointsRef = collection(db, WAYPOINTS_COLLECTION);
      const q = query(waypointsRef, orderBy('latitude', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const waypoints = [];
      querySnapshot.forEach((doc) => {
        waypoints.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return waypoints;
    } catch (error) {
      console.error('Error fetching waypoints:', error);
      throw error;
    }
  },

  // Add a new waypoint to Firestore
  async addWaypoint(waypointData) {
    try {
      const waypointsRef = collection(db, WAYPOINTS_COLLECTION);
      const docRef = await addDoc(waypointsRef, {
        ...waypointData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...waypointData };
    } catch (error) {
      console.error('Error adding waypoint:', error);
      throw error;
    }
  },

  // Update an existing waypoint
  async updateWaypoint(id, waypointData) {
    try {
      const waypointRef = doc(db, WAYPOINTS_COLLECTION, id);
      await updateDoc(waypointRef, {
        ...waypointData,
        updatedAt: new Date()
      });
      return { id, ...waypointData };
    } catch (error) {
      console.error('Error updating waypoint:', error);
      throw error;
    }
  },

  // Delete a waypoint
  async deleteWaypoint(id) {
    try {
      const waypointRef = doc(db, WAYPOINTS_COLLECTION, id);
      await deleteDoc(waypointRef);
      return id;
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      throw error;
    }
  },

  // Initialize database with sample data if empty
  async initializeWithSampleData() {
    try {
      const existingWaypoints = await this.getWaypoints();
      
      if (existingWaypoints.length === 0) {
        console.log('No waypoints found, initializing with sample data...');
        
        const sampleWaypoints = [
          {
            title: "Croatan: The Meat-Eating Forest",
            description: "Where Venus flytraps evolved in the nutrient-poor Coastal Plain",
            address: "NC-24, Newport, NC 28570",
            latitude: 34.79,
            longitude: -76.88,
            radius: 1600,
            contentType: "text",
            textContent: "As you drive through these vast longleaf pine flatwoods, you are passing through one of nature's most ingenious survival stories. Welcome to Croatan National Forest, where the sandy, nutrient-poor soil created evolutionary masterpieces - plants that turned carnivorous to survive. Those marshy spots hiding under the pines are what scientists call meat-eaters row, home to native pitcher plants, sundews, and the legendary Venus flytrap. These plants evolved here because the acidic, sandy soil is too poor in nitrogen and phosphorus for normal plant nutrition, so they developed the incredible ability to digest insects instead. The Venus flytrap, found naturally nowhere else on Earth except within a 60-mile radius of Wilmington, can snap shut in just one-tenth of a second when tiny trigger hairs detect prey. But the Venus flytrap is not alone in this botanical house of horrors. Pitcher plants create slippery death traps filled with digestive enzymes, while sundews use sparkling dewdrops that are actually sticky glue to capture flies. This 160,000-acre forest represents one of the last intact longleaf pine ecosystems, once covering 90 million acres across the Southeast. These towering pines, some over 100 feet tall, are perfectly adapted to survive the frequent fires that sweep through, their thick bark protecting them while clearing out competing vegetation. The Croatan is also a crucial piece of North Carolina's military heritage - during World War II, this remote wilderness served as training grounds for amphibious assault troops preparing for D-Day. Today, as you drive through this seemingly peaceful forest, remember you are witnessing millions of years of evolutionary ingenuity, where plants learned to hunt to survive in one of nature's most challenging environments.",
            audioFile: "https://firebasestorage.googleapis.com/v0/b/drivebyhistory-976cd.appspot.com/o/audio%2Fwaypoint-1.mp3?alt=media"
          },
          {
            title: "Cherry Point: Where Marines Take Flight",
            description: "The world's largest Marine Corps air station built for WWII and beyond",
            address: "US-70, Havelock, NC 28532",
            latitude: 34.9,
            longitude: -76.88,
            radius: 1600,
            contentType: "text",
            textContent: "Those runway lights stretching into the distance and the roar of jets overhead mark your passage by Marine Corps Air Station Cherry Point - the largest Marine Corps air station in the world. Built in just 11 months during 1942, this massive installation spans 29,000 acres and features 8,000-foot runways that were engineering marvels for their time. The base was named after the area's abundant cherry trees, but there is nothing sweet about the firepower that launches from here daily. Cherry Point has been the launching pad for American air power for over 80 years, from World War II torpedo bombers to today's cutting-edge F-35B Lightning II stealth fighters. During WWII, Cherry Point trained thousands of Marine aviators who would go on to fight in the Pacific Theater, including the famous Black Sheep Squadron led by Pappy Boyington. The base played a crucial role in developing dive-bombing techniques that proved decisive in battles like Guadalcanal and Iwo Jima. But Cherry Point is not just about history - it is about the future of American military aviation. This is where Marines master the art of close air support, learning to provide precision firepower for troops on the ground. The base is home to Marine Aircraft Group 14 and houses everything from massive KC-130 aerial refueling tankers to vertical-takeoff F-35Bs that can hover like helicopters. What makes Cherry Point truly unique is its depot operations - this is where the Marine Corps rebuilds and modernizes its entire aircraft fleet. Planes that have seen combat around the world come here to be completely torn down and rebuilt to like-new condition. As you drive by, you are witnessing not just a military base, but the nerve center of Marine Corps aviation that keeps America's most elite fighting force ready to respond anywhere in the world within hours.",
            audioFile: "https://firebasestorage.googleapis.com/v0/b/drivebyhistory-976cd.appspot.com/o/audio%2Fwaypoint-2.mp3?alt=media"
          },
          {
            title: "New Bern: Where Colonial America Began",
            description: "Swiss and German settlers built North Carolina's first capital in 1710",
            address: "US-70 Bypass, New Bern, NC 28560",
            latitude: 35.09,
            longitude: -77.04,
            radius: 1600,
            contentType: "text",
            textContent: "As you cross these waters where the Neuse and Trent Rivers meet, you are driving over the birthplace of organized European settlement in North Carolina. Below you lies New Bern, founded in 1710 by Swiss and German settlers led by Baron Christoph von Graffenried, making it the state's first permanent European town and eventual colonial capital. Those steeples you can glimpse upriver mark a city that was once the center of colonial power in North Carolina. New Bern served as the colonial capital for 60 years and was home to the magnificent Tryon Palace, built in 1770 as the royal governor's residence. The palace was so grand that it was called the most beautiful building in colonial America, complete with formal gardens and the most advanced architecture of its time. But New Bern's claim to fame extends far beyond politics and architecture. This is where American education took a revolutionary step forward - North Carolina's first public school opened here in 1766, establishing the principle that education should be available to all children, not just the wealthy. The school was funded by public taxes, a radical concept that would later influence the entire American public education system. During the Civil War, New Bern's strategic location made it a prize worth fighting for. Union forces captured the city in 1862 and held it for the remainder of the war, making it a crucial supply base and haven for escaped slaves. Over 10,000 formerly enslaved people found refuge here, creating one of the largest communities of free African Americans in the wartime South. But perhaps New Bern's most delicious contribution to American culture happened in 1898, when pharmacist Caleb Bradham invented Pepsi-Cola right here in his downtown drugstore. He originally called it Brads Drink and claimed it aided digestion and boosted energy. From that humble beginning, Pepsi grew into one of the world's most recognized brands. As you drive over these historic waters, remember you are crossing the spot where colonial ambition, educational innovation, Civil War drama, and American entrepreneurship all converged to shape our nation's story.",
            audioFile: "https://firebasestorage.googleapis.com/v0/b/drivebyhistory-976cd.appspot.com/o/audio%2Fwaypoint-3.mp3?alt=media"
          }
        ];

        const promises = sampleWaypoints.map(waypoint => this.addWaypoint(waypoint));
        await Promise.all(promises);
        
        console.log('Sample data initialized successfully');
        return await this.getWaypoints();
      }
      
      return existingWaypoints;
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
}; 