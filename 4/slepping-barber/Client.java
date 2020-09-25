
public class Client extends Thread {

  Barbershop barbershop;
  String name;

  public Client(Barbershop barbershop, String name) {
    this.barbershop = barbershop;
    this.name = name;
  }

  public void run() {

    System.out.println(this.name + " --> arrived");
    int currClients;

    while (true) {
      currClients = barbershop.currClients.get();
      if (currClients >= barbershop.queueSize) {
        System.out.println(this.name + " GO AWAY");
        return;
      }
      if (barbershop.currClients.compareAndSet(currClients, currClients + 1)) {
        break;
      }
    }

    synchronized (barbershop.waitingRoom) {
      barbershop.waitingRoom.add(this);
    }
    synchronized (barbershop.barberMutex) {
      barbershop.barberMutex.notify();
    }

    synchronized (this) {
      try {
        wait();
        System.out.println(this.name + " started haircut");
      } catch (InterruptedException e) {
      }
    }

    synchronized (this) {
      try {
        wait();
        System.out.println(this.name + " finished haircut");
      } catch (InterruptedException e) {
      }
    }

  }

}
