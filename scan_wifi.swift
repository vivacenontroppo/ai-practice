import Foundation
import CoreWLAN

let client = CWWiFiClient.shared()
guard let interface = client.interface() else {
    print("No Wi-Fi interface found")
    exit(1)
}

do {
    let networks = try interface.scanForNetworks(withSSID: nil)
    for network in networks {
        if let ssid = network.ssid {
            print(ssid)
        }
    }
} catch {
    print("Error scanning: \(error)")
}